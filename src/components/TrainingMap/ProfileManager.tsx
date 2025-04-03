import React, { useState, useEffect } from 'react';
import { Profile, ProfileState, Track } from '../../types/TrainingMap';

interface ProfileManagerProps {
  onProfileChange: (tracks: Track[]) => void;
}

const LOCAL_STORAGE_KEY = 'awsLearningMapProfiles';

export const ProfileManager: React.FC<ProfileManagerProps> = ({ onProfileChange }) => {
  const [profileState, setProfileState] = useState<ProfileState>({
    profiles: [],
    activeProfileId: null,
  });
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    // Load profiles from local storage on component mount
    const savedProfiles = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      setProfileState(parsed);
    }
  }, []);

  useEffect(() => {
    // Save profiles to local storage whenever they change
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profileState));
  }, [profileState]);

  const createProfile = () => {
    if (!newProfileName.trim()) return;

    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: newProfileName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks: [],
    };

    setProfileState(prev => ({
      profiles: [...prev.profiles, newProfile],
      activeProfileId: newProfile.id,
    }));
    setNewProfileName('');
    onProfileChange(newProfile.tracks);
  };

  const selectProfile = (profileId: string) => {
    setProfileState(prev => ({
      ...prev,
      activeProfileId: profileId,
    }));
    const profile = profileState.profiles.find(p => p.id === profileId);
    if (profile) {
      onProfileChange(profile.tracks);
    }
  };

  const updateCurrentProfile = (tracks: Track[]) => {
    if (!profileState.activeProfileId) return;

    setProfileState(prev => ({
      ...prev,
      profiles: prev.profiles.map(profile =>
        profile.id === prev.activeProfileId
          ? {
              ...profile,
              tracks,
              updatedAt: new Date().toISOString(),
            }
          : profile
      ),
    }));
  };

  const deleteProfile = (profileId: string) => {
    setProfileState(prev => ({
      profiles: prev.profiles.filter(p => p.id !== profileId),
      activeProfileId: prev.activeProfileId === profileId ? null : prev.activeProfileId,
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Learning Map Profiles</h2>
      
      {/* Create new profile */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          placeholder="New profile name"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={createProfile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create
        </button>
      </div>

      {/* Profile list */}
      <div className="space-y-2">
        {profileState.profiles.map(profile => (
          <div
            key={profile.id}
            className={`flex items-center justify-between p-3 rounded ${
              profile.id === profileState.activeProfileId
                ? 'bg-blue-100 border-blue-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div>
              <div className="font-medium">{profile.name}</div>
              <div className="text-sm text-gray-500">
                Updated: {new Date(profile.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => selectProfile(profile.id)}
                className={`px-3 py-1 rounded ${
                  profile.id === profileState.activeProfileId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {profile.id === profileState.activeProfileId ? 'Active' : 'Select'}
              </button>
              <button
                onClick={() => deleteProfile(profile.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileManager; 