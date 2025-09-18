import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { dataService } from '../services/supabase';
import { useAuth } from '../services/AuthContext';

const HomeContainer = styled.div`
  flex: 1;
  background: linear-gradient(180deg, #FFFFFF 0%, #E0EFFF 100%);
  min-height: 100vh;
`;

const Header = styled.header`
  padding: 60px 20px 20px;
  background: transparent;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const TitleIcon = styled.div`
  margin-right: 12px;
  color: #000;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0;
  flex: 1;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchButton = styled.button`
  padding: 8px;
  border-radius: 20px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000;

  &:hover {
    background: #e9ecef;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  font-weight: 400;
  padding-left: 44px;
  margin: 0;
`;

const StatsSection = styled.section`
  padding: 16px 20px;
  background: #ffffff;
`;

const StatsGrid = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const StatCard = styled.div`
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin: 0 4px;

  &.resolved {
    background: #f0fdf4;
  }
`;

const StatIconContainer = styled.div`
  margin-bottom: 8px;
  color: ${props => props.color || '#000'};
  display: flex;
  justify-content: center;
`;

const StatNumber = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
  font-weight: 400;
`;

const MainContent = styled.main`
  padding: 0 20px;
`;

const FilterSection = styled.section`
  padding: 16px 0;
  background: #ffffff;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const FilterTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
  }
`;

const FilterSummary = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterSummaryText = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const ClearFiltersButton = styled.button`
  background: none;
  border: none;
  color: #000;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #666;
  }
`;

const IssuesFeed = styled.section`
  padding-bottom: 20px;
`;

const IssuesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const IssueCard = styled.article`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const IssueHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: 600;
  color: #666;
  font-size: 16px;
`;

const IssueUserInfo = styled.div`
  flex: 1;
`;

const IssueUserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 2px;
`;

const IssueTimeAgo = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const IssueBadges = styled.div`
  display: flex;
  gap: 8px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch(props.status) {
      case 'resolved': return '#f3f4f6';
      case 'in_progress': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'resolved': return '#6b7280';
      case 'in_progress': return '#92400e';
      default: return '#6b7280';
    }
  }};
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch(props.priority) {
      case 'high': return '#fef3c7';
      case 'medium': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.priority) {
      case 'high': return '#92400e';
      case 'medium': return '#92400e';
      default: return '#6b7280';
    }
  }};
`;

const IssueTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #18181b;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const IssueDescription = styled.p`
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
  margin: 0 0 12px 0;
`;

const IssueFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

const IssueLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 12px;
`;

const IssueActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #6b7280;
`;

const EmptySubtitle = styled.p`
  font-size: 14px;
  margin: 0;
`;

const FAB = styled.button`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: #000000;
  border: none;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  z-index: 1001;
  color: white;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    impactScore: 0,
    activeMembers: 0,
    resolvedThisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesData, statsData] = await Promise.all([
        dataService.getIssues(),
        dataService.getCommunityStats()
      ]);
      
      setIssues(issuesData.slice(0, 10)); // Show latest 10 issues
      setStats(statsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
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

  const handleIssueClick = (issue) => {
    navigate('/map', { state: { selectedIssue: issue } });
  };

  const handleSearchPress = () => {
    alert('Search functionality coming soon!');
  };

  // Animate stats numbers on mount
  useEffect(() => {
    if (!loading && stats) {
      setTimeout(() => {
        const impactElement = document.getElementById('impactScore');
        const membersElement = document.getElementById('activeMembers');
        const resolvedElement = document.getElementById('resolvedThisWeek');
        
        if (impactElement) impactElement.textContent = stats.impactScore;
        if (membersElement) membersElement.textContent = stats.activeMembers;
        if (resolvedElement) resolvedElement.textContent = stats.resolvedThisWeek;
      }, 100);
    }
  }, [loading, stats]);

  return (
    <HomeContainer>
      <Header>
        <HeaderContent>
          <TitleContainer>
            <TitleSection>
              <TitleIcon>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </TitleIcon>
              <Title>Jamaica Issues</Title>
            </TitleSection>
            
            <HeaderButtons>
              <SearchButton onClick={handleSearchPress}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </SearchButton>
            </HeaderButtons>
          </TitleContainer>
          
          <Subtitle>Stay informed about Jamaica</Subtitle>
        </HeaderContent>
      </Header>

      {/* Community Stats */}
      <StatsSection>
        <StatsGrid>
          <StatCard>
            <StatIconContainer>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </StatIconContainer>
            <StatNumber id="impactScore">0</StatNumber>
            <StatLabel>Impact Score</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIconContainer>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </StatIconContainer>
            <StatNumber id="activeMembers">0</StatNumber>
            <StatLabel>Active Members</StatLabel>
          </StatCard>
          
          <StatCard className="resolved">
            <StatIconContainer color="#16a34a">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </StatIconContainer>
            <StatNumber id="resolvedThisWeek">0</StatNumber>
            <StatLabel>Resolved This Week</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      <MainContent>
        {/* Filter Section */}
        <FilterSection>
          <FilterHeader>
            <FilterTitle>Community Issues</FilterTitle>
            <FilterButton onClick={() => setShowFilter(!showFilter)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
              </svg>
              Filter
            </FilterButton>
          </FilterHeader>
          
          <FilterSummary>
            <FilterSummaryText>Showing {issues.length} of {issues.length} issues</FilterSummaryText>
            <ClearFiltersButton>Clear filters</ClearFiltersButton>
          </FilterSummary>
        </FilterSection>

        {/* Issues Feed */}
        <IssuesFeed>
          <IssuesContainer>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>
                  Loading community issues...
                </p>
              </LoadingContainer>
            ) : issues.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </EmptyIcon>
                <EmptyTitle>No issues found</EmptyTitle>
                <EmptySubtitle>Be the first to report an issue in Jamaica</EmptySubtitle>
              </EmptyState>
            ) : (
              issues.map((issue) => (
                <IssueCard key={issue.id} onClick={() => handleIssueClick(issue)}>
                  <IssueHeader>
                    <Avatar>
                      {(issue.profiles?.name || 'A').charAt(0).toUpperCase()}
                    </Avatar>
                    <IssueUserInfo>
                      <IssueUserName>{issue.profiles?.name || 'Anonymous'}</IssueUserName>
                      <IssueTimeAgo>{formatTimeAgo(issue.created_at)}</IssueTimeAgo>
                    </IssueUserInfo>
                    <IssueBadges>
                      <StatusBadge status={issue.status}>{issue.status}</StatusBadge>
                      <PriorityBadge priority={issue.priority}>{issue.priority}</PriorityBadge>
                    </IssueBadges>
                  </IssueHeader>
                  
                  <IssueTitle>{issue.title}</IssueTitle>
                  <IssueDescription>{issue.description}</IssueDescription>
                  
                  <IssueFooter>
                    <IssueLocation>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {issue.address || issue.location || 'Jamaica'}
                    </IssueLocation>
                    
                    <IssueActions>
                      <ActionButton>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 14l5-5 5 5"/>
                        </svg>
                        0
                      </ActionButton>
                      <ActionButton>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Comment
                      </ActionButton>
                      <ActionButton>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        Share
                      </ActionButton>
                    </IssueActions>
                  </IssueFooter>
                </IssueCard>
              ))
            )}
          </IssuesContainer>
        </IssuesFeed>
      </MainContent>

      {/* Floating Action Button */}
      <FAB onClick={() => navigate('/report')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </FAB>
    </HomeContainer>
  );
};

export default Home;