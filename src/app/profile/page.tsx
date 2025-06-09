"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiMail, FiMapPin, FiLink2, FiTwitter, FiInstagram, FiFacebook, FiEdit3, FiSave, FiX, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Type for profile updates - all fields are optional
type UserProfileUpdate = Partial<{
  name: string;
  title: string;
  bio: string;
  image: string;
  email: string;
  location: string;
  website: string;
  social: {
    twitter: string;
    instagram: string;
    facebook: string;
  };
  about: {
    education: string;
    experience: string;
    interests: string;
  };
  stats: {
    writings: number;
    photos: number;
    followers: number;
  };
  achievements: {
    awards: string[];
    publications: Array<{ title: string; description: string }>;
    recognition: string[];
  };
  accentColor?: string;
}>;

interface Achievements {
  awards: string[];
  publications: Array<{ title: string; description: string }>;
  recognition: string[];
}

interface UserProfile {
  name: string;
  title: string;
  bio: string;
  image: string;
  email: string;
  location: string;
  website: string;
  social: {
    twitter: string;
    instagram: string;
    facebook: string;
  };
  about: {
    education: string;
    experience: string;
    interests: string;
  };
  stats: {
    writings: number;
    photos: number;
    followers: number;
  };
  achievements: Achievements;
  accentColor?: string;
}

export default function EditableProfilePage() {
  // Use a default userId or get from authentication when implemented
  const userId = 'default';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: "",
    title: "",
    bio: "",
    image: "",
    email: "",
    location: "",
    website: "",
    social: {
      twitter: "",
      instagram: "",
      facebook: "",
    },
    about: {
      education: "",
      experience: "",
      interests: "",
    },
    stats: {
      writings: 0,
      photos: 0,
      followers: 0,
    },
    achievements: {
      awards: [],
      publications: [],
      recognition: []
    }
  });

  const [editForm, setEditForm] = useState<UserProfileUpdate>({});
  const currentData = isEditing ? { ...user, ...editForm } : user;

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching profile data from:', `/api/profile`);
        const response = await fetch(`/api/profile`);
        if (response.ok) {
          const userData = await response.json();
          console.log('Received user data:', userData);
          setUser(userData);
        } else {
          console.error('Failed to fetch user data:', response.status, response.statusText);
          // Try to read the error response
          try {
            const errorData = await response.text();
            console.error('Error details:', errorData);
          } catch (e) {
            console.error('Could not parse error details');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setEditForm({ ...user });
    setIsEditing(true);
  };

  // Apply accent color to CSS variables
  useEffect(() => {
    if (user.accentColor) {
      document.documentElement.style.setProperty('--accent', user.accentColor);
      // Calculate a slightly darker shade for the foreground
      const hsl = user.accentColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const [h, s, l] = hsl;
      const fgLuminance = l > 50 ? 10 : 98; // Dark text for light colors, light for dark
      document.documentElement.style.setProperty('--accent-foreground', `${h} ${s}% ${fgLuminance}%`);
    }
  }, [user.accentColor]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving profile data to API');
      // Send userId in the request body instead of the URL
      const dataWithId = { ...editForm, userId };
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithId),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile update response:', result);
        // Merge the updated fields with existing user data
        setUser(prevUser => ({
          ...prevUser,
          ...editForm,
          // Ensure nested objects are properly merged
          social: { ...prevUser.social, ...editForm.social },
          about: { ...prevUser.about, ...editForm.about },
          stats: { ...prevUser.stats, ...editForm.stats },
          achievements: {
            ...prevUser.achievements,
            ...editForm.achievements,
            // Ensure arrays are properly merged
            awards: editForm.achievements?.awards ?? prevUser.achievements.awards,
            publications: editForm.achievements?.publications ?? prevUser.achievements.publications,
            recognition: editForm.achievements?.recognition ?? prevUser.achievements.recognition,
          }
        }));
        setIsEditing(false);
        // You could add a toast notification here
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile:', response.status, response.statusText);
        // Try to read the error response
        try {
          const errorData = await response.text();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error details');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // You could add error handling/toast here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = <K extends keyof UserProfile>(
    parent: K,
    field: string,
    value: any
  ) => {
    setEditForm(prev => {
      const parentObj = (prev[parent] as NestedObject) || {};
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: value
        }
      } as UserProfile;
    });
  };

  const handleArrayInputChange = <K extends keyof UserProfile>(
    parent: K,
    field: string,
    index: number,
    value: string
  ) => {
    setEditForm(prev => {
      const parentObj = (prev[parent] as NestedObject) || {};
      const currentArray = Array.isArray(parentObj[field]) ? [...parentObj[field]] : [];
      
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: currentArray.map((item: any, i: number) => (i === index ? value : item))
        }
      } as UserProfile;
    });
  };

  const addArrayItem = <K extends keyof UserProfile>(
    parent: K,
    field: string,
    defaultValue: any = ""
  ) => {
    setEditForm(prev => {
      const parentObj = (prev[parent] as NestedObject) || {};
      const currentArray = Array.isArray(parentObj[field]) ? [...parentObj[field]] : [];
      
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: [...currentArray, defaultValue]
        }
      } as UserProfile;
    });
  };

  const removeArrayItem = <K extends keyof UserProfile>(
    parent: K,
    field: string,
    index: number
  ) => {
    setEditForm(prev => {
      const parentObj = (prev[parent] as NestedObject) || {};
      const currentArray = Array.isArray(parentObj[field]) ? [...parentObj[field]] : [];
      
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: currentArray.filter((_: any, i: number) => i !== index)
        }
      } as UserProfile;
    });
  };

  const addPublicationItem = () => {
    setEditForm((prev) => {
      const currentAchievements: Achievements = {
        awards: prev.achievements?.awards || [],
        publications: prev.achievements?.publications || [],
        recognition: prev.achievements?.recognition || []
      };
      
      return {
        ...prev,
        achievements: {
          ...currentAchievements,
          publications: [
            ...currentAchievements.publications,
            { title: "", description: "" }
          ]
        }
      } as UserProfile;
    });
  };

  const handlePublicationChange = (index: number, field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      achievements: {
        ...prev.achievements,
        publications: prev.achievements?.publications?.map((pub, i) => 
          i === index ? { ...pub, [field]: value } : pub
        ) || []
      }
    }));
  };

  const removePublication = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      achievements: {
        ...prev.achievements,
        publications: prev.achievements?.publications?.filter((_, i) => i !== index) || []
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-10 md:py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-10 md:py-16">
      <div className="flex flex-col items-center space-y-6 md:space-y-0 md:flex-row md:space-x-10">
        <div className="relative">
          <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden shadow-lg">
            <Image
              src={currentData.image}
              alt={currentData.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {isEditing && (
            <div className="mt-4 w-40 md:w-48">
              <Input
                type="url"
                placeholder="Profile image URL"
                value={editForm.image || ""}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="w-full"
              />
              <Button variant="outline" className="mt-2 w-full" size="sm">
                <FiUpload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.name || ""}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    className="text-2xl font-bold border-0 px-0 focus:ring-0 focus:border-b focus:border-gray-300"
                  />
                  <Input
                    value={editForm.title || ""}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Your title/profession"
                    className="text-muted-foreground border-0 px-0 focus:ring-0 focus:border-b focus:border-gray-300"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{currentData.name}</h1>
                  <p className="text-muted-foreground mt-1">{currentData.title}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 md:self-start">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                    <FiX className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button onClick={handleEdit}>
                    <FiEdit3 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  
                  {/* <div className="relative">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-10 h-10 p-0 rounded-full overflow-hidden"
                      style={editForm.accentColor ? { backgroundColor: `hsl(${editForm.accentColor})` } : {}}
                      title="Change accent color"
                    >
                      <span className="sr-only">Change accent color</span>
                    </Button>
                    {showColorPicker && (
                      <div className="absolute right-0 mt-2 p-2 bg-card border rounded-lg shadow-lg z-10">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            '0 0% 60%',  // Gray
                            '220 70% 50%', // Blue
                            '160 60% 45%', // Teal
                            '30 80% 55%',  // Orange
                            '340 75% 55%', // Pink
                            '280 65% 60%', // Purple
                          ].map((color) => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground transition-colors"
                              style={{ backgroundColor: `hsl(${color})` }}
                              onClick={() => {
                                handleInputChange('accentColor', color);
                                setShowColorPicker(false);
                              }}
                              title={`Set accent color to ${color}`}
                            >
                              <span className="sr-only">Set color {color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div> */}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 max-w-2xl">
            {isEditing ? (
              <Textarea
                value={editForm.bio || ""}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="resize-none"
              />
            ) : (
              <p className="text-md">{currentData.bio}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 justify-center md:justify-start">
            {isEditing ? (
              <div className="w-full space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  <FiMail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editForm.email || ""}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editForm.location || ""}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Location"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FiLink2 className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editForm.website || ""}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Website"
                    className="flex-1"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FiMail className="h-4 w-4" />
                  <span>{currentData.email}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FiMapPin className="h-4 w-4" />
                  <span>{currentData.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FiLink2 className="h-4 w-4" />
                  <span>{currentData.website}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full max-w-md">
                <Input
                  value={editForm.social?.twitter || ""}
                  onChange={(e) => handleNestedInputChange('social', 'twitter', e.target.value)}
                  placeholder="Twitter handle (@username)"
                  className="text-sm"
                />
                <Input
                  value={editForm.social?.instagram || ""}
                  onChange={(e) => handleNestedInputChange('social', 'instagram', e.target.value)}
                  placeholder="Instagram handle (@username)"
                  className="text-sm"
                />
                <Input
                  value={editForm.social?.facebook || ""}
                  onChange={(e) => handleNestedInputChange('social', 'facebook', e.target.value)}
                  placeholder="Facebook username"
                  className="text-sm"
                />
              </div>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <FiTwitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <FiInstagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <FiFacebook className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{currentData.stats?.writings}</CardTitle>
            <CardDescription>Writings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{currentData.stats?.photos}</CardTitle>
            <CardDescription>Photos</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{currentData.stats?.followers}</CardTitle>
            <CardDescription>Followers</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-2 mb-8">
            <TabsTrigger value="about">About Me</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
                <CardDescription>Personal information and background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Education</h3>
                      <Textarea
                        value={editForm.about?.education || ""}
                        onChange={(e) => handleNestedInputChange('about', 'education', e.target.value)}
                        placeholder="Your educational background..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Experience</h3>
                      <Textarea
                        value={editForm.about?.experience || ""}
                        onChange={(e) => handleNestedInputChange('about', 'experience', e.target.value)}
                        placeholder="Your professional experience..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Interests</h3>
                      <Textarea
                        value={editForm.about?.interests || ""}
                        onChange={(e) => handleNestedInputChange('about', 'interests', e.target.value)}
                        placeholder="Your interests and hobbies..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Education</h3>
                      <p>{currentData.about?.education}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Experience</h3>
                      <p>{currentData.about?.experience}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Interests</h3>
                      <p>{currentData.about?.interests}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Awards, publications, and recognition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Awards Section */}
                <div>
                  <h3 className="font-medium text-lg mb-2">Awards</h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      {editForm.achievements?.awards?.map((award, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={award}
                            onChange={(e) => handleArrayInputChange('achievements', 'awards', index, e.target.value)}
                            placeholder="Award description"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('achievements', 'awards', index)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addArrayItem('achievements', 'awards', '')}
                        className="w-full"
                      >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Add Award
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-2 list-disc list-inside">
                      {currentData.achievements?.awards?.map((award, index) => (
                        <li key={index}>{award}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Publications Section */}
                <div>
                  <h3 className="font-medium text-lg mb-2">Publications</h3>
                  {isEditing ? (
                    <div className="space-y-3">
                      {editForm.achievements?.publications?.map((pub, index) => (
                        <div key={index} className="flex gap-2 p-3 border rounded-lg">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={pub.title}
                              onChange={(e) => handlePublicationChange(index, 'title', e.target.value)}
                              placeholder="Publication title"
                            />
                            <Input
                              value={pub.description}
                              onChange={(e) => handlePublicationChange(index, 'description', e.target.value)}
                              placeholder="Publication description"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removePublication(index)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addPublicationItem}
                        className="w-full"
                      >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Add Publication
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-2 list-disc list-inside">
                      {currentData.achievements?.publications?.map((pub, index) => (
                        <li key={index}>
                          <strong>{pub.title}</strong> - {pub.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recognition Section */}
                <div>
                  <h3 className="font-medium text-lg mb-2">Recognition</h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      {editForm.achievements?.recognition?.map((item: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => handleArrayInputChange('achievements', 'recognition', index, e.target.value)}
                            placeholder="Recognition description"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('achievements', 'recognition', index)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addArrayItem('achievements', 'recognition', '')}
                        className="w-full"
                      >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Add Recognition
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-2 list-disc list-inside">
                      {currentData.achievements?.recognition?.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}