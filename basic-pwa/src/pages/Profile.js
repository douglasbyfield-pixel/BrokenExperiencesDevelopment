import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../services/AuthContext';
import { dataService } from '../services/supabase';

const ProfileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFFFF 0%, #E0EFFF 100%);
`;

const Header = styled.header`
  background: #000000;
  color: white;
  padding: 60px 20px 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const HeaderContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255,255,255,0.3);
`;

const ProfileName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const ProfileEmail = styled.p`
  font-size: 16px;
  margin: 0 0 16px 0;
  opacity: 0.9;
`;

const ProfileStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MainContent = styled.main`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const Section = styled.section`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

const MenuItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
    margin: 0 -24px;
    padding: 16px 24px;
    border-radius: 8px;
  }
`;

const MenuItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuItemIcon = styled.div`
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

const MenuItemText = styled.div`
  text-align: left;
`;

const MenuItemTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
`;

const MenuItemSubtitle = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const MenuItemRight = styled.div`
  color: #94a3b8;
`;

const RecentIssues = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const IssueItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const IssueInfo = styled.div`
  flex: 1;
`;

const IssueTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const IssueDate = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const IssueStatus = styled.div`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch(props.status) {
      case 'resolved': return '#dcfce7';
      case 'in_progress': return '#fef3c7';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'resolved': return '#16a34a';
      case 'in_progress': return '#d97706';
      default: return '#64748b';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #64748b;
`;

const EmptySubtitle = styled.p`
  font-size: 14px;
  margin: 0;
`;

const ActionButton = styled.button`
  width: 100%;
  background: ${props => props.danger ? '#ef4444' : '#000000'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px ${props => props.danger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #64748b;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Profile = () => {
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    points: 0
  });

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get user's issues
      const allIssues = await dataService.getIssues();
      const userOnlyIssues = allIssues.filter(issue => issue.reported_by === user.id);
      setUserIssues(userOnlyIssues.slice(0, 5)); // Show latest 5
      
      // Calculate stats
      const resolvedCount = userOnlyIssues.filter(issue => issue.status === 'resolved').length;
      setUserStats({
        totalIssues: userOnlyIssues.length,
        resolvedIssues: resolvedCount,
        points: userOnlyIssues.length * 10 + resolvedCount * 5 // Simple point system
      });
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <ProfileContainer>
      <Header>
        <HeaderContent>
          <ProfileAvatar>{getUserInitials()}</ProfileAvatar>
          <ProfileName>{getUserName()}</ProfileName>
          <ProfileEmail>{user.email}</ProfileEmail>
          
          <ProfileStats>
            <StatItem>
              <StatNumber>{userStats.totalIssues}</StatNumber>
              <StatLabel>Issues Reported</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{userStats.resolvedIssues}</StatNumber>
              <StatLabel>Resolved</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{userStats.points}</StatNumber>
              <StatLabel>Points</StatLabel>
            </StatItem>
          </ProfileStats>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Recent Issues */}
        <Section>
          <SectionTitle>
            <SectionIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </SectionIcon>
            Recent Issues
          </SectionTitle>
          
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              Loading your issues...
            </LoadingContainer>
          ) : userIssues.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </EmptyIcon>
              <EmptyTitle>No issues reported yet</EmptyTitle>
              <EmptySubtitle>Start by reporting your first community issue</EmptySubtitle>
              <ActionButton onClick={() => navigate('/report')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Report an Issue
              </ActionButton>
            </EmptyState>
          ) : (
            <RecentIssues>
              {userIssues.map((issue) => (
                <IssueItem key={issue.id}>
                  <IssueInfo>
                    <IssueTitle>{issue.title}</IssueTitle>
                    <IssueDate>{formatTimeAgo(issue.created_at)}</IssueDate>
                  </IssueInfo>
                  <IssueStatus status={issue.status}>
                    {issue.status}
                  </IssueStatus>
                </IssueItem>
              ))}
            </RecentIssues>
          )}
        </Section>

        {/* Settings */}
        <Section>
          <SectionTitle>
            <SectionIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </SectionIcon>
            Settings
          </SectionTitle>
          
          <MenuItem onClick={() => alert('Notifications settings coming soon!')}>
            <MenuItemLeft>
              <MenuItemIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </MenuItemIcon>
              <MenuItemText>
                <MenuItemTitle>Notifications</MenuItemTitle>
                <MenuItemSubtitle>Manage push notifications</MenuItemSubtitle>
              </MenuItemText>
            </MenuItemLeft>
            <MenuItemRight>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </MenuItemRight>
          </MenuItem>

          <MenuItem onClick={() => alert('Privacy settings coming soon!')}>
            <MenuItemLeft>
              <MenuItemIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </MenuItemIcon>
              <MenuItemText>
                <MenuItemTitle>Privacy</MenuItemTitle>
                <MenuItemSubtitle>Control your data</MenuItemSubtitle>
              </MenuItemText>
            </MenuItemLeft>
            <MenuItemRight>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </MenuItemRight>
          </MenuItem>

          <MenuItem onClick={() => alert('About page coming soon!')}>
            <MenuItemLeft>
              <MenuItemIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </MenuItemIcon>
              <MenuItemText>
                <MenuItemTitle>About</MenuItemTitle>
                <MenuItemSubtitle>App version and info</MenuItemSubtitle>
              </MenuItemText>
            </MenuItemLeft>
            <MenuItemRight>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </MenuItemRight>
          </MenuItem>
        </Section>

        {/* Sign Out */}
        <Section>
          <ActionButton danger onClick={handleSignOut}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </ActionButton>
        </Section>
      </MainContent>
    </ProfileContainer>
  );
};

export default Profile;