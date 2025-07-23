import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Group, GroupMember } from '../types';
import { useAuth } from '../context/AuthContext';

export const useGroups = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Query groups where the current user is a member
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', { userId: currentUser.uid })
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupList: Group[] = [];
        snapshot.forEach((doc) => {
          groupList.push({ id: doc.id, ...doc.data() } as Group);
        });
        
        setGroups(groupList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const createGroup = async (name: string, description: string, currency: string = 'USD') => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      const newGroup = {
        name,
        description,
        currency,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [
          {
            userId: currentUser.uid,
            displayName: currentUser.displayName || 'User',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            role: 'admin',
            joinedAt: new Date().toISOString(),
          },
        ],
      };
      
      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      return { id: docRef.id, ...newGroup };
    } catch (err) {
      console.error('Error creating group:', err);
      throw new Error('Failed to create group');
    }
  };

  const updateGroup = async (groupId: string, data: Partial<Group>) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating group:', err);
      throw new Error('Failed to update group');
    }
  };

  const addMember = async (groupId: string, member: Omit<GroupMember, 'joinedAt'>) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      
      await updateDoc(groupRef, {
        members: arrayUnion({
          ...member,
          joinedAt: new Date().toISOString(),
        }),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error adding member:', err);
      throw new Error('Failed to add member to group');
    }
  };

  const removeMember = async (groupId: string, userId: string) => {
    try {
      // First get the group to find the member
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDocs(collection(db, 'groups'));
      const group = groupSnap.docs.find(doc => doc.id === groupId)?.data() as Group;
      
      if (!group) throw new Error('Group not found');
      
      const memberToRemove = group.members.find(m => m.userId === userId);
      
      if (!memberToRemove) throw new Error('Member not found');
      
      await updateDoc(groupRef, {
        members: arrayRemove(memberToRemove),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error removing member:', err);
      throw new Error('Failed to remove member from group');
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await deleteDoc(doc(db, 'groups', groupId));
    } catch (err) {
      console.error('Error deleting group:', err);
      throw new Error('Failed to delete group');
    }
  };

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    addMember,
    removeMember,
    deleteGroup,
  };
};