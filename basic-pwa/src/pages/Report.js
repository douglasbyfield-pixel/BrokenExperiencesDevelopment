import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { dataService } from '../services/supabase';
import { useAuth } from '../services/AuthContext';

const ReportContainer = styled.div`
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
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const TitleIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin: 0 0 16px 64px;
  opacity: 0.9;
  font-weight: 400;
`;

const ProgressContainer = styled.div`
  margin-left: 64px;
`;

const ProgressBar = styled.div`
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: white;
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 12px;
  opacity: 0.9;
  font-weight: 600;
`;

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const FormSection = styled.section`
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
  margin: 0 0 16px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s ease;
  background: #f8fafc;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #000000;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s ease;
  background: #f8fafc;
  resize: vertical;
  min-height: 120px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #000000;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.active ? '#000000' : '#f8fafc'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: 2px solid ${props => props.active ? '#000000' : '#e2e8f0'};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #000000;
    background: ${props => props.active ? '#000000' : '#f1f5f9'};
  }
`;

const PriorityContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const PriorityButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.active ? 'white' : '#f8fafc'};
  color: ${props => props.active ? props.color : '#64748b'};
  border: 2px solid ${props => props.active ? props.color : '#e2e8f0'};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.color};
    background: ${props => props.active ? 'white' : '#f1f5f9'};
  }
`;

const PriorityDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const ImagePickerButton = styled.button`
  width: 100%;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;

  &:hover {
    border-color: #000000;
    background: #f1f5f9;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SelectedImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  background: #f0f0f0;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #ef4444;

  &:hover {
    background: white;
  }
`;

const ChangeImageButton = styled.button`
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #f1f5f9;
  }
`;

const LocationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
`;

const LocationInfo = styled.div`
  flex: 1;
`;

const LocationLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
`;

const LocationText = styled.div`
  font-size: 16px;
  color: #1e293b;
  font-weight: 600;
`;

const SubmitContainer = styled.div`
  margin-top: 32px;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #000000;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const categoryOptions = [
  { value: 'infrastructure', label: 'Infrastructure', icon: 'construct-outline' },
  { value: 'road_maintenance', label: 'Road Maintenance', icon: 'car-outline' },
  { value: 'safety', label: 'Safety', icon: 'shield-checkmark-outline' },
  { value: 'environment', label: 'Environment', icon: 'leaf-outline' },
  { value: 'maintenance', label: 'Maintenance', icon: 'build-outline' },
  { value: 'accessibility', label: 'Accessibility', icon: 'accessibility-outline' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'critical', label: 'Critical', color: '#dc2626' },
];

const Report = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
    priority: 'medium',
    image: null
  });
  const [location, setLocation] = useState('Getting location...');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });

      // Try to get address from coordinates
      try {
        const response = await fetch(
          `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          setLocation(data.display_name);
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Error getting address:', error);
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocation('Location access denied');
    }
  };

  const calculateProgress = () => {
    let progress = 0;
    if (formData.title.trim()) progress += 25;
    if (formData.description.trim()) progress += 25;
    if (formData.category) progress += 25;
    if (formData.priority) progress += 25;
    return progress;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          handleInputChange('image', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    if (!user) {
      alert('Please log in to report issues');
      return;
    }

    if (!currentLocation) {
      alert('Location is required to report issues. Please enable location services.');
      return;
    }

    setLoading(true);
    
    try {
      const issueData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        reported_by: user.id,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: location
      };

      const newIssue = await dataService.createIssue(issueData);
      
      alert('Issue reported successfully! Thank you for helping improve Jamaica.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'infrastructure',
        priority: 'medium',
        image: null
      });
      
      // Navigate to map to see the new issue
      navigate('/map');
      
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = calculateProgress();

  return (
    <ReportContainer>
      <Header>
        <HeaderContent>
          <TitleContainer>
            <TitleIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </TitleIcon>
            <Title>Report Issue</Title>
          </TitleContainer>
          <Subtitle>Help improve Jamaica by reporting community issues</Subtitle>
          
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill progress={progress} />
            </ProgressBar>
            <ProgressText>{progress}% complete</ProgressText>
          </ProgressContainer>
        </HeaderContent>
      </Header>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          {/* Issue Details */}
          <FormSection>
            <SectionTitle>Issue Details</SectionTitle>
            <SectionSubtitle>
              Provide a clear title and detailed description of the issue
            </SectionSubtitle>
            
            <InputContainer>
              <InputIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </InputIcon>
              <Input
                type="text"
                placeholder="What's the issue? (e.g., Pothole on Main Street)"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </InputContainer>

            <InputContainer>
              <InputIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="12" y1="9" x2="8" y2="9"/>
                </svg>
              </InputIcon>
              <TextArea
                placeholder="Describe the issue in detail... What exactly is wrong? How does it affect the community?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </InputContainer>
          </FormSection>

          {/* Photo Upload */}
          <FormSection>
            <SectionTitle>Add Photo (Optional)</SectionTitle>
            <SectionSubtitle>
              A picture helps others understand the issue better and increases the chance of it being resolved
            </SectionSubtitle>
            
            {formData.image ? (
              <ImageContainer>
                <SelectedImage src={formData.image} alt="Selected" />
                <RemoveImageButton onClick={() => handleInputChange('image', null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </RemoveImageButton>
                <ChangeImageButton onClick={handleImagePick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Change Photo
                </ChangeImageButton>
              </ImageContainer>
            ) : (
              <ImagePickerButton type="button" onClick={handleImagePick}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>
                  Take Photo or Choose from Gallery
                </span>
              </ImagePickerButton>
            )}
          </FormSection>

          {/* Category Selection */}
          <FormSection>
            <SectionTitle>Category</SectionTitle>
            <SectionSubtitle>
              Select the category that best describes your issue
            </SectionSubtitle>
            
            <OptionsContainer>
              {categoryOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  type="button"
                  active={formData.category === option.value}
                  onClick={() => handleInputChange('category', option.value)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {option.label}
                </OptionButton>
              ))}
            </OptionsContainer>
          </FormSection>

          {/* Priority Selection */}
          <FormSection>
            <SectionTitle>Priority Level</SectionTitle>
            <SectionSubtitle>
              How urgent is this issue? This helps prioritize community responses
            </SectionSubtitle>
            
            <PriorityContainer>
              {priorityOptions.map((option) => (
                <PriorityButton
                  key={option.value}
                  type="button"
                  active={formData.priority === option.value}
                  color={option.color}
                  onClick={() => handleInputChange('priority', option.value)}
                >
                  <PriorityDot color={option.color} />
                  {option.label}
                </PriorityButton>
              ))}
            </PriorityContainer>
          </FormSection>

          {/* Location */}
          <FormSection>
            <SectionTitle>Location</SectionTitle>
            <SectionSubtitle>
              Your current location will be used to pinpoint the issue on the map
            </SectionSubtitle>
            
            <LocationContainer>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <LocationInfo>
                <LocationLabel>Current Location</LocationLabel>
                <LocationText>{location}</LocationText>
              </LocationInfo>
            </LocationContainer>
          </FormSection>

          {/* Submit */}
          <SubmitContainer>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner />
                  Submitting...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13"/>
                    <polygon points="22,2 15,22 11,13 2,9"/>
                  </svg>
                  Submit Report
                </>
              )}
            </SubmitButton>
          </SubmitContainer>
        </form>
      </FormContainer>
    </ReportContainer>
  );
};

export default Report;