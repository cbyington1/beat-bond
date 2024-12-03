"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface User {
  id: string;
  name: string;
}

const AddFriends = (): JSX.Element => {
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sample users for demonstration purposes
  const sampleUsers: User[] = [
    { id: "user1", name: "Alice Johnson" },
    { id: "user2", name: "Bob Smith" },
    { id: "user3", name: "Charlie Brown" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredUsers([]);
    } else {
      setFilteredUsers(
        sampleUsers.filter((user) =>
          user.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  const handleAddFriend = (userId: string): void => {
    setError(null);
    setSuccessMessage(null);

    try {
      // Add friend logic here (API call or other)
      // Example: await fetch(`/api/add-friend/${userId}`, { method: "POST" });

      setSuccessMessage("Friend request sent successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to send friend request. Please try again.");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Add Friends</h1>
        <p>Please sign in to search for users and add friends.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Add Friends</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* User List */}
      {filteredUsers.length > 0 ? (
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <ul className="space-y-2">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between space-x-2"
              >
                <span>{user.name}</span>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        searchQuery.trim() !== "" && (
          <p className="text-gray-400 text-center mt-4">No users found.</p>
        )
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-900/50 text-green-200 rounded-lg">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default AddFriends;
