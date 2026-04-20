import { useState } from 'react';
import { fetchHistory, convertAccount } from '../../../services/authService';
import {
  emitCreateRoom,
  emitJoinRoom,
  emitGetActiveRooms,
  emitGetOnlinePlayers,
} from '../../../services/socketService';

const useLobbyViewModel = ({ socket, token, setToken, setPlayer, setMessage }) => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('profile');
  const [playerHistory, setPlayerHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertUsername, setConvertUsername] = useState('');
  const [convertPassword, setConvertPassword] = useState('');
  const [convertLoading, setConvertLoading] = useState(false);

  const createRoom = () => {
    if (socket && roomName.trim()) {
      emitCreateRoom(socket, roomName.trim());
    }
  };

  const joinRoom = (id) => {
    const targetId = id || roomId;
    if (socket && targetId.trim()) {
      emitJoinRoom(socket, targetId.trim().toUpperCase());
    }
  };

  const refreshRooms = () => {
    if (socket) {
      emitGetActiveRooms(socket);
      emitGetOnlinePlayers(socket);
    }
  };

  const openProfileModal = () => {
    setShowProfileModal(true);
    setProfileTab('profile');
    if (!playerHistory) {
      handleFetchHistory();
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileTab('profile');
  };

  const handleFetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const result = await fetchHistory(token);
      if (result.ok) {
        setPlayerHistory(result.data.data);
      } else {
        setMessage(result.data.message || 'Failed to load history');
      }
    } catch (error) {
      setMessage('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleConvertAccount = async () => {
    if (!convertUsername.trim() || !convertPassword.trim()) {
      setMessage('Please enter both username and password');
      return;
    }

    setConvertLoading(true);
    try {
      const result = await convertAccount(token, convertUsername.trim(), convertPassword.trim());
      if (result.ok) {
        setPlayer(result.data.data.player);
        setToken(result.data.data.token);
        localStorage.setItem('token', result.data.data.token);
        setShowConvertModal(false);
        setConvertUsername('');
        setConvertPassword('');
        setMessage('Account upgraded successfully!');
      } else {
        setMessage(result.data.message);
      }
    } catch (error) {
      setMessage('Conversion failed');
    } finally {
      setConvertLoading(false);
    }
  };

  return {
    // Room form
    roomName,
    setRoomName,
    roomId,
    setRoomId,
    createRoom,
    joinRoom,
    refreshRooms,
    // Modals
    showHelpModal,
    setShowHelpModal,
    showProfileModal,
    openProfileModal,
    closeProfileModal,
    profileTab,
    setProfileTab,
    showConvertModal,
    setShowConvertModal,
    // History
    playerHistory,
    loadingHistory,
    handleFetchHistory,
    // Convert
    convertUsername,
    setConvertUsername,
    convertPassword,
    setConvertPassword,
    convertLoading,
    handleConvertAccount,
  };
};

export default useLobbyViewModel;