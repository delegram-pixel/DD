"use client";

import { useState, useEffect, useRef } from "react";
import { FiSave, FiMoon, FiSun, FiMonitor, FiLock, FiUser, FiLayout, FiLogOut, FiInstagram, FiTwitter, FiFacebook, FiCamera } from "react-icons/fi";
import { Widget } from "@uploadcare/react-widget";
// Importing the Widget component is sufficient as it will handle uploading functionality
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadcareReady, setUploadcareReady] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    website: '',
    location: '',
    bio: '',
    title: '',
    image: '',
    social: {
      twitter: '',
      instagram: '',
      facebook: ''
    },
    about: {
      education: '',
      experience: '',
      interests: ''
    }
  });
  
  // Reference for the Uploadcare widget
  const widgetRef = useRef(null);

  // Initialize Uploadcare - the Widget component now handles initialization internally
  useEffect(() => {
    // Set Uploadcare as ready since the Widget component handles initialization
    setUploadcareReady(true);
  }, []);

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          console.log('Received profile data:', data);
          setProfileData({
            name: data.name || '',
            email: data.email || '',
            website: data.website || '',
            location: data.location || '',
            bio: data.bio || '',
            title: data.title || '',
            image: data.image || '',
            social: {
              twitter: data.twitterHandle || '',
              instagram: data.instagramHandle || '',
              facebook: data.facebookHandle || ''
            },
            about: {
              education: data.education || '',
              experience: data.experience || '',
              interests: data.interests || ''
            }
          });
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  // Handle profile picture upload from Uploadcare
  // Type definition for Uploadcare file info
  interface UploadcareFileInfo {
    cdnUrl: string;
    name?: string;
    size?: number;
    isImage?: boolean;
    originalUrl?: string;
    [key: string]: any;
  }

  const handleProfilePictureUpload = (fileInfo: UploadcareFileInfo) => {
    if (fileInfo) {
      // Get the CDN URL from Uploadcare
      const imageUrl = fileInfo.cdnUrl;
      setProfileData(prev => ({
        ...prev,
        image: imageUrl
      }));
      
      toast.success("Profile picture uploaded successfully");
    }
  };

  // Handle input changes for profile data
  const handleProfileInputChange = (field, value, parent = null) => {
    setProfileData(prev => {
      if (!parent) {
        // Handle top-level fields
        return {
          ...prev,
          [field]: value
        };
      } else if (parent === 'social') {
        // Handle social fields
        return {
          ...prev,
          social: {
            ...prev.social,
            [field]: value
          }
        };
      } else if (parent === 'about') {
        // Handle about fields
        return {
          ...prev,
          about: {
            ...prev.about,
            [field]: value
          }
        };
      }
      return prev;
    });
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Validate email field before sending
      if (!profileData.email || profileData.email.trim() === '') {
        toast.error("Email is required");
        setIsLoading(false);
        return;
      }

      // Ensure we have at least a default name
      if (!profileData.name || profileData.name.trim() === '') {
        profileData.name = "User";
      }

      // Format data for the API - transform from our nested structure to flat API structure
      const formattedData = {
        name: profileData.name,
        email: profileData.email,
        title: profileData.title,
        bio: profileData.bio,
        website: profileData.website,
        location: profileData.location,
        image: profileData.image, // Add image URL to the data being sent to API
        social: {
          twitter: profileData.social.twitter,
          instagram: profileData.social.instagram,
          facebook: profileData.social.facebook
        },
        twitterHandle: profileData.social.twitter,
        instagramHandle: profileData.social.instagram,
        facebookHandle: profileData.social.facebook,
        education: profileData.about.education,
        experience: profileData.about.experience,
        interests: profileData.about.interests
      };
      
      console.log('Saving profile data from settings page:', formattedData);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        toast.success("Profile settings saved successfully!");
        setShowSuccessModal(true);
      } else {
        // Try to get the error message from the response
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || 'Failed to save profile settings';
        } catch (e) {
          errorMessage = errorText || `Failed with status: ${response.status}`;
        }
        
        console.error('Failed to update profile:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating profile:', errorMessage);
      toast.error(`An error occurred while saving: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = () => {
    setIsLoading(true);
    // In a real app, you would send a request to update the password
    // For now, we'll just simulate it
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password updated successfully!");
    }, 1000);
  };

  const handleSavePreferences = () => {
    setIsLoading(true);
    // In a real app, you would save theme preferences to user settings
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Preferences saved successfully!");
    }, 1000);
  };

  return (
    <div className="container px-4 py-10 md:py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3 mb-8">
          {/* <TabsTrigger value="account">
            <FiUser className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger> */}
          <TabsTrigger value="appearance">
            <FiLayout className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security">
            <FiLock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="profile">
            <FiCamera className="mr-2 h-4 w-4" />
            Profile Photo
          </TabsTrigger>
        </TabsList>

        {/* <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleProfileInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => handleProfileInputChange('title', e.target.value)}
                    placeholder="e.g. Writer, Editor, Journalist"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleProfileInputChange('website', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => handleProfileInputChange('location', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Social Media</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <FiTwitter className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Twitter handle"
                        value={profileData.social.twitter}
                        onChange={(e) => handleProfileInputChange('twitter', e.target.value, 'social')}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiInstagram className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Instagram handle"
                        value={profileData.social.instagram}
                        onChange={(e) => handleProfileInputChange('instagram', e.target.value, 'social')}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiFacebook className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Facebook handle"
                        value={profileData.social.facebook}
                        onChange={(e) => handleProfileInputChange('facebook', e.target.value, 'social')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>About Information</Label>
                  <div className="grid gap-2">
                    <Label htmlFor="education" className="text-sm text-gray-500">Education</Label>
                    <Textarea
                      id="education"
                      placeholder="Your educational background"
                      value={profileData.about.education}
                      onChange={(e) => handleProfileInputChange('education', e.target.value, 'about')}
                    />
                    <Label htmlFor="experience" className="text-sm text-gray-500">Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Your professional experience"
                      value={profileData.about.experience}
                      onChange={(e) => handleProfileInputChange('experience', e.target.value, 'about')}
                    />
                    <Label htmlFor="interests" className="text-sm text-gray-500">Interests</Label>
                    <Textarea
                      id="interests"
                      placeholder="Your interests and hobbies"
                      value={profileData.about.interests}
                      onChange={(e) => handleProfileInputChange('interests', e.target.value, 'about')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? "Saving..." : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent> */}

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how your portfolio looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <FiSun className="h-5 w-5" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <FiMoon className="h-5 w-5" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2"
                  >
                    <FiMonitor className="h-5 w-5" />
                    System
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font">Font Preference</Label>
                <Select defaultValue="inter">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (Default)</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <Select defaultValue="violet">
                  <SelectTrigger>
                    <SelectValue placeholder="Select accent color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="violet">Violet (Default)</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences} disabled={isLoading}>
                {isLoading ? "Saving..." : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden relative bg-gray-100 flex items-center justify-center mb-6">
                  {profileData.image ? (
                    <img 
                      src={profileData.image} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <FiUser size={40} className="text-gray-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadcareReady && (
                    <Widget
                      ref={widgetRef}
                      publicKey="02a4af4c0ca3c67ea0e6" 
                      id="profile-image"
                      tabs="file camera url"
                      previewStep
                      crop="1:1"
                      imageShrink="1024x1024"
                      clearable
                      onChange={handleProfilePictureUpload}
                    >
                    {({ openDialog }) => (
                      <Button
                        type="button"
                        onClick={openDialog}
                        className="flex items-center gap-2"
                      >
                        <FiCamera size={16} />
                        Upload New Photo
                      </Button>
                    )}
                  </Widget>)}
                  
                  {profileData.image && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          image: ''
                        }));
                        toast.success("Profile picture removed");
                      }}
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
                  Upload a clear photo of yourself. A square image of at least 400x400 pixels works best.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? "Saving..." : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleSavePassword} disabled={isLoading}>
                {isLoading ? "Updating..." : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
              <Button variant="destructive">
                <FiLogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Updated</DialogTitle>
            <DialogDescription>
              Your profile has been successfully updated and saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
