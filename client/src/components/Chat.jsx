import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Chat = ({ user, token, onLogout }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect socket
        // Since we proxy /socket.io in vite config, we can connect to relative path
        socketRef.current = io('/', {
            query: { userId: user._id },
            transports: ['websocket']
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to socket');
        });

        socketRef.current.on('receiveMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socketRef.current.on('messageDeleted', (updatedMsg) => {
            setMessages((prev) => prev.map((msg) =>
                msg._id === updatedMsg._id ? updatedMsg : msg
            ));
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [user._id]);

    useEffect(() => {
        fetchUsers();
    }, [token]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedUser]); // Scroll when switching user too

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedUser) return;

        socketRef.current.emit('sendMessage', {
            receiverId: selectedUser._id,
            text: inputText
        });

        setInputText('');
    };

    const deleteMessage = (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            socketRef.current.emit('deleteMessage', { messageId });
        }
    };

    // Filter messages for the current chat
    const displayedMessages = messages.filter(msg =>
        (msg.senderId === user._id && msg.receiverId === selectedUser?._id) ||
        (msg.senderId === selectedUser?._id && msg.receiverId === user._id)
    );

    return (
        <div className="chat-layout glass">
            <div className="sidebar">
                <div className="sidebar-header">
                    Chats
                </div>
                <div className="user-list">
                    {users.map(u => (
                        <div
                            key={u._id}
                            className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                            onClick={() => setSelectedUser(u)}
                        >
                            <div className="avatar">{u.username[0]}</div>
                            <div className="user-info">
                                <div style={{ fontWeight: 500 }}>{u.username}</div>
                            </div>
                            <div className={`status-indicator ${u.isOnline ? 'online' : ''}`}></div>
                        </div>
                    ))}
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>

            <div className="chat-main">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <div className="avatar">{selectedUser.username[0]}</div>
                            <h3>{selectedUser.username}</h3>
                        </div>
                        <div className="messages-area">
                            {displayedMessages.map(msg => (
                                <div
                                    key={msg._id || Math.random()}
                                    className={`message ${msg.senderId === user._id ? 'sent' : 'received'} ${msg.isDeleted ? 'deleted' : ''}`}
                                >
                                    {msg.text}
                                    {!msg.isDeleted && msg.senderId === user._id && (
                                        <button
                                            className="delete-msg-btn"
                                            onClick={() => deleteMessage(msg._id)}
                                            title="Delete Message"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="message-input-area" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
