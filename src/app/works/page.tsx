"use client"

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiArrowRight, FiX, FiUpload, FiImage } from "react-icons/fi";
import Image from 'next/image';

// Uploadcare imports
import { uploadFile } from '@uploadcare/upload-client';
import { Widget } from '@uploadcare/react-widget';

interface Writing {
  id?: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  date: string;
  contentUrl?: string; // URL to the content file on Uploadcare
  content?: string; // For displaying content (fetched from Uploadcare)
}

interface WritingCardProps {
  writing: Writing;
  index: number;
}

function WritingCard({ writing, index }: WritingCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [content, setContent] = useState<string>('');
  const [isLoadingContent, setIsLoading] = useState(false);

  // Fetch content when modal opens (supports both Uploadcare and base64 data URLs)
  const fetchContentFromUploadcare = async () => {
    if (!writing.contentUrl || content) return;
    
    setIsLoading(true);
    try {
      // Check if this is a base64 data URL
      if (writing.contentUrl.startsWith('data:text/plain;base64,')) {
        // Extract and decode the base64 content
        const base64Content = writing.contentUrl.replace('data:text/plain;base64,', '');
        try {
          // Use the matching decoding approach for our simpler encoding
          const binaryString = atob(base64Content);
          const decodedContent = decodeURIComponent(escape(binaryString));
          
          console.log('Successfully decoded content');
          setContent(decodedContent);
        } catch (decodeError) {
          console.error('Error decoding base64 content:', decodeError);
          setContent('Failed to decode content. Please try again.');
        }
      } else {
        // Regular URL fetch (from Uploadcare or other source)
        const response = await fetch(writing.contentUrl);
        if (!response.ok) throw new Error('Failed to fetch content');
        const textContent = await response.text();
        setContent(textContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowContent = () => {
    setShowFullContent(true);
    fetchContentFromUploadcare();
  };

  return (
    <>
      <div className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow bg-white">
        <div className="aspect-video relative bg-gray-200">
          {writing.image ? (
            <Image
              src={writing.image}
              alt={writing.title}
              width={800}
              height={450}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <FiImage className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-1">{writing.title}</h3>
              <p className="text-sm text-gray-600">{writing.category}</p>
            </div>
            <span className="text-xs text-gray-500">{writing.date}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{writing.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {writing.tags && writing.tags.length > 0 ? (
              writing.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No tags</span>
            )}
          </div>
          <button 
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            onClick={handleShowContent}
          >
            Read More <FiArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Full Content Modal */}
      {showFullContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFullContent(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{writing.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{writing.category} • {writing.date}</p>
              </div>
              <button
                onClick={() => setShowFullContent(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="prose prose-lg max-w-none">
                {isLoadingContent ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                    <span className="ml-3 text-gray-600">Loading content...</span>
                  </div>
                ) : content ? (
                  <div className="whitespace-pre-wrap font-serif leading-relaxed text-gray-800">
                    {content}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No content available for this work.
                  </div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {writing.tags && writing.tags.length > 0 ? (
                    writing.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Enhanced API client with better error handling
const apiClient = {
  async getWritings(): Promise<Writing[]> {
    try {
      const response = await fetch('/api/writings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching writings:', error);
      return [];
    }
  },

  async createWriting(writing: Omit<Writing, 'id'>): Promise<Writing> {
    const response = await fetch('/api/writings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(writing),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

const categories = ["Essay", "Poetry", "Story"];

function AddWorkDialog({ isOpen, onClose, onAddWork }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAddWork: (work: Writing) => void 
}) {
  const [formData, setFormData] = useState({
    title: "",
    category: "Essay",
    description: "",
    content: "",
    image: "",
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Essay",
      description: "",
      content: "",
      image: "",
      tags: []
    });
    setTagInput("");
    setError("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Upload text content to Uploadcare
  const uploadTextToUploadcare = async (textContent: string): Promise<string> => {
    // Hardcoded Uploadcare public key that we know works
    const publicKey = "02a4af4c0ca3c67ea0e6";
    
    try {
      console.log('Starting Uploadcare text upload with public key:', publicKey);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], `${formData.title.replace(/\s+/g, '_')}_content.txt`, { type: 'text/plain' });
      
      console.log('Preparing file for upload:', file.name, file.size, 'bytes');
      
      // Add a timeout promise to detect if the request hangs
      const uploadPromise = uploadFile(file, {
        publicKey: publicKey,
        store: 'auto',
        metadata: {
          subsystem: 'writing-portfolio',
          purpose: 'text-content',
          title: formData.title
        }
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timed out after 30 seconds')), 30000);
      });
      
      // Race the upload against the timeout
      const result = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      console.log('Upload successful, received UUID:', result.uuid);
      return `https://ucarecdn.com/${result.uuid}/`;
    } catch (error: any) {
      console.error('Failed to upload text content:', error);
      console.error('Error details:', error.message, error.stack, error.cause);
      
      // More specific error message based on the error type
      if (error.message.includes('timed out')) {
        throw new Error('Upload to Uploadcare timed out. Please try again or check your network connection.');
      } else if (error.message.includes('NetworkError') || error.message.includes('network')) {
        throw new Error('Network error when uploading to Uploadcare. Please check your internet connection.');
      } else {
        throw new Error(`Failed to upload content to Uploadcare: ${error.message}`);
      }
    }
  };

  // Simplified approach for image upload using direct Widget opening
  const handleFileUpload = () => {
    // Instead of programmatically creating a file input and using the uploadFile API directly,
    // we'll use the Uploadcare dialog which has better error handling
    setError("");
    
    // This will trigger the Uploadcare widget to open manually
    const uploadcareButton = document.querySelector('.uploadcare--widget__button_type_open');
    if (uploadcareButton && uploadcareButton instanceof HTMLElement) {
      uploadcareButton.click();
    } else {
      setError('Could not initialize upload dialog. Please try using the upload button below.');
    }
  };

  // Uploadcare Widget handler
  const handleUploadcareChange = (fileInfo: any) => {
    if (fileInfo) {
      const imageUrl = fileInfo.cdnUrl;
      handleInputChange('image', imageUrl);
      setError("");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Please enter a title for your work.");
      return false;
    }
    
    if (!formData.description.trim()) {
      setError("Please enter a description for your work.");
      return false;
    }
    
    if (!formData.content.trim()) {
      setError("Please enter the content of your work.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // FALLBACK APPROACH: Instead of using Uploadcare for text content,
      // we'll store the content directly in the database
      let contentUrl = "";
      
      // Create a base64 encoded version of the content directly
      if (formData.content) {
        try {
          // Store the content directly in the database rather than using Uploadcare
          // Use a simpler and more reliable encoding approach
          const base64Content = btoa(unescape(encodeURIComponent(formData.content)));
          contentUrl = `data:text/plain;base64,${base64Content}`;
          console.log('Successfully encoded content for storage');
        } catch (err) {
          console.error('Error encoding content:', err);
          // Fallback to empty content URL if encoding fails
          contentUrl = '';
        }
      }
      
      // Create the new work object
      const newWork: Omit<Writing, 'id'> = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        contentUrl: contentUrl, // Use the generated content URL
        image: formData.image || "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop",
        tags: formData.tags,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      };

      // Save to database via API
      const savedWork = await apiClient.createWriting(newWork);
      
      // Add the work to local state
      onAddWork(savedWork);
      
      // Reset form and close dialog
      resetForm();
      onClose();
      
    } catch (error: any) {
      console.error('Error publishing work:', error);
      setError(error.message || "Failed to publish your work. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-4xl bg-black rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#6d28d9]">Add New Work</h2>
            <p className="text-sm text-white mt-1">Share your writing with the world</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-600 rounded-full disabled:opacity-50"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-black">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your work's title"
                  className="w-full h-11 px-3 border border-gray-200 rounded-md focus:border-[#6d28d9] focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Category *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full h-11 px-3 border border-gray-200 rounded-md focus:border-[#6d28d9] focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your work in a few sentences..."
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-200 rounded-md focus:border-[#6d28d9] focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 h-10 px-3 border border-gray-200 rounded-md focus:border-[#6d28d9] focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || isSubmitting}
                    className="px-4 h-10 border border-gray-200 rounded-md text-white hover:bg-purple-600 bg-[#6d28d9] disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isSubmitting}
                          className="hover:bg-blue-100 rounded-full p-0.5 disabled:opacity-50"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Your Work Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write or paste your work content here..."
                  className="w-full min-h-[200px] px-3 py-2 border border-gray-200 rounded-md focus:border-[#6d28d9] focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-mono text-sm"
                  disabled={isSubmitting}
                />
                {/* <p className="text-xs text-">
                  This content will be stored securely on Uploadcare and linked to your database record.
                </p> */}
              </div>

              {/* Cover Image section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Cover Image</label>
                
                {/* Uploadcare Widget */}
                {(
                  <div className="space-y-3 bg-black">
                    <Widget
                      publicKey="02a4af4c0ca3c67ea0e6"
                      onChange={handleUploadcareChange}
                      imageShrink="800x600"
                      previewStep={true}
                      tabs="file camera url"
                      effects="crop,rotate,mirror,flip"
                      systemDialog={true}
                      inputAcceptTypes="image/*"
                      multipleMax={1}
                      locale="en"
                      
                    />
                  </div>
                )}

                {/* Manual Upload Button */}
                <div 
                  className={`border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors ${isSubmitting || isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  onClick={!isSubmitting && !isUploading ? handleFileUpload : undefined}
                >
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-bg-[#6d28d9] border-t-transparent mx-auto" />
                      <p className="text-sm text-gray-600">Uploading image...</p>
                    </div>
                  ) : formData.image ? (
                    <div className="space-y-3">
                      <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <>
                      <FiImage className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Click to upload cover image</p>
                      <p className="text-xs text-gray-400">
                        Recommended: 800x600px, JPG or PNG
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Or paste image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg or https://ucarecdn.com/uuid/"
                  className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-[#6d28d9] focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-200 rounded-md hover:bg-gray-100 text-black disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="px-8 py-2 bg-[#6d28d9] hover:bg-blue-700 text-white rounded-md flex items-center disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <FiUpload className="mr-2 h-4 w-4 bg-[#6d28d9]" />
                Publish Work
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorksPage() {
  const [writings, setWritings] = useState<Writing[]>([]);
  const [isAddWorkDialogOpen, setIsAddWorkDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load writings from database on component mount
  useEffect(() => {
    const loadWritings = async () => {
      setIsLoading(true);
      setError("");
      try {
        const fetchedWritings = await apiClient.getWritings();
        setWritings(fetchedWritings);
      } catch (error) {
        console.error('Error loading writings:', error);
        setError("Failed to load your works. Please refresh the page to try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWritings();
  }, []);

  const handleAddWork = (newWork: Writing) => {
    setWritings(prevWritings => [newWork, ...prevWritings]);
  };

  const filteredWritings = writings.filter(writing => {
    if (activeTab === "all") return true;
    if (activeTab === "essays") return writing.category === "Essay";
    if (activeTab === "poetry") return writing.category === "Poetry";
    if (activeTab === "stories") return writing.category === "Story";
    return true;
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-10 md:py-16 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your works...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-10 md:py-16 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Works</h1>
          <p className="text-gray-600 mt-1">
            A collection of my writings, essays, and creative pieces ({writings.length} works)
          </p> 
        </div>
        <button 
          onClick={() => setIsAddWorkDialogOpen(true)}
          className="flex items-center px-4 py-2 hover:bg-purple-600 bg-[#6d28d9] text-white rounded-md  transition-colors"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add New Work
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <input
            placeholder="Search by title, tag, or keyword..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          <FiFilter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="w-full">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600 mb-8">
          {[
            { key: "all", label: "All" },
            { key: "essays", label: "Essays" },
            { key: "poetry", label: "Poetry" },
            { key: "stories", label: "Stories" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {filteredWritings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {writings.length === 0 
                ? "No works found. Start by adding your first piece!" 
                : "No works match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWritings.map((writing, index) => (
              <WritingCard key={writing.id || `${writing.title}-${index}`} writing={writing} index={index} />
            ))}
          </div>
        )}
      </div>

      <AddWorkDialog
        isOpen={isAddWorkDialogOpen}
        onClose={() => setIsAddWorkDialogOpen(false)}
        onAddWork={handleAddWork}
      />
    </div>
  );
}