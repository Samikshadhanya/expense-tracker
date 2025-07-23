import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroups } from '../hooks/useGroups';
import { CreditCard, PlusCircle, Users, TrendingUp, ArrowRightLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { groups, loading } = useGroups();
  
  // Mock data for the dashboard
  const totalOwed = 245.75;
  const totalYouOwe = 178.32;
  const netBalance = totalOwed - totalYouOwe;
  const isPositive = netBalance >= 0;
  
  const recentActivity = [
    {
      id: '1',
      title: 'Dinner at Italian Restaurant',
      amount: 85.50,
      date: '2023-06-15',
      group: 'Friends Trip',
      paidBy: 'Alex',
    },
    {
      id: '2',
      title: 'Groceries',
      amount: 32.80,
      date: '2023-06-12',
      group: 'Roommates',
      paidBy: 'You',
    },
    {
      id: '3',
      title: 'Movie Tickets',
      amount: 24.00,
      date: '2023-06-10',
      group: 'Friends Trip',
      paidBy: 'Sarah',
    },
  ];
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        {/* Welcome message */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Welcome, {currentUser?.displayName || 'Friend'}!
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Here's a summary of your expenses and balances.
          </p>
        </div>
        
        {/* Balance summary */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total you are owed
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-success-500">
                        ${totalOwed.toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total you owe
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-error-500">
                        ${totalYouOwe.toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${isPositive ? 'bg-green-100' : 'bg-red-100'} rounded-md p-3`}>
                  <ArrowRightLeft className={`h-6 w-6 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Net balance
                    </dt>
                    <dd>
                      <div className={`text-lg font-medium ${isPositive ? 'text-success-500' : 'text-error-500'}`}>
                        {isPositive ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent activity */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
              <Link
                to="/expenses"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">{activity.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {activity.group}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Paid by {activity.paidBy}
                      </p>
                      <p className="mt-1 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${activity.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Your Groups */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Your Groups</h3>
            <Link to="/groups/new">
              <Button
                size="sm"
                leftIcon={<PlusCircle size={16} />}
              >
                Create Group
              </Button>
            </Link>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading groups...</p>
            ) : groups.length > 0 ? (
              groups.slice(0, 3).map((group) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
                      <Users className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">{group.name}</h4>
                      <p className="text-sm text-gray-500">
                        {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new group.</p>
                  <div className="mt-6">
                    <Link to="/groups/new">
                      <Button leftIcon={<PlusCircle size={16} />}>
                        Create Group
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {groups.length > 3 && (
              <Link
                to="/groups"
                className="flex items-center justify-center bg-gray-50 rounded-lg shadow-sm p-5 border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="text-primary-600 font-medium">View all groups</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8 mb-12">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link
              to="/expenses/new"
              className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-primary-100 rounded-full p-3 mb-2">
                <CreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add Expense</span>
            </Link>
            
            <Link
              to="/groups/new"
              className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-secondary-100 rounded-full p-3 mb-2">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">New Group</span>
            </Link>
            
            <Link
              to="/settlements/new"
              className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-green-100 rounded-full p-3 mb-2">
                <ArrowRightLeft className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Settle Up</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-gray-100 rounded-full p-3 mb-2">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};