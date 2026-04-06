import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminCourseForm = memo(() => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    category: 'default',
    isPublished: false,
    chapters: []
  });
  const [newChapter, setNewChapter] = useState('');
  const [newVideo, setNewVideo] = useState({
    chapterId: '',
    title: '',
    youtubeUrl: ''
  });
  const [showVideoForm, setShowVideoForm] = useState('');
  const [showNotesForm, setShowNotesForm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notesUploading, setNotesUploading] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState({});
  const [newNoteUrl, setNewNoteUrl] = useState({});

  const extractYouTubeTitle = async (url) => {
    if (!url) return '';
    const videoId = extractVideoId(url);
    if (!videoId) return '';
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyA9vT6S_R6lL2XUZdN3X1lX1lX1lX1lX1lX&part=snippet`);
      const data = await response.json();
      if (data.items && data.items[0] && data.items[0].snippet) {
        return data.items[0].snippet.title;
      }
    } catch (e) {
      console.log('Could not fetch YouTube title');
    }
    return '';
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    const videoId = extractVideoId(url);
    const chapterId = newVideo.chapterId;
    
    if (videoId) {
      setNewVideo({ 
        ...newVideo, 
        youtubeUrl: url, 
        chapterId: chapterId,
        title: `Video ${videoId}` 
      });
    } else {
      setNewVideo({ ...newVideo, youtubeUrl: url, chapterId: chapterId });
    }
  };

  const extractDriveFileName = (url) => {
    if (!url) return '';
    
    // Handle docs.google.com/document/d/.../edit
    if (url.includes('docs.google.com/document/d/')) {
      const match = url.match(/\/document\/d\/([^\/]+)/);
      if (match) return 'Document - ' + match[1].substring(0, 8);
    }
    
    // Handle docs.google.com/spreadsheets/d/.../edit
    if (url.includes('docs.google.com/spreadsheets/d/')) {
      const match = url.match(/\/spreadsheets\/d\/([^\/]+)/);
      if (match) return 'Spreadsheet - ' + match[1].substring(0, 8);
    }
    
    // Handle docs.google.com/presentation/d/.../edit
    if (url.includes('docs.google.com/presentation/d/')) {
      const match = url.match(/\/presentation\/d\/([^\/]+)/);
      if (match) return 'Presentation - ' + match[1].substring(0, 8);
    }
    
    // Handle drive.google.com/file/d/.../view
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([^\/]+)/);
      if (match) return 'File - ' + match[1].substring(0, 8);
    }
    
    // Handle drive.google.com/drive/folders/...
    if (url.includes('drive.google.com/drive/folders/')) {
      const match = url.match(/\/folders\/([^\/]+)/);
      if (match) return 'Folder - ' + match[1].substring(0, 8);
    }
    
    return 'Google Drive Link';
  };

  const handleNoteUrlChange = (e, chapterId) => {
    const url = e.target.value;
    setNewNoteUrl({ ...newNoteUrl, [chapterId]: url });
    
    if (url && !newNoteTitle[chapterId]) {
      const detectedName = extractDriveFileName(url);
      setNewNoteTitle({ ...newNoteTitle, [chapterId]: detectedName });
    }
  };

  const handleFileSelect = (e, chapterId) => {
    const file = e.target.files[0];
    if (file) {
      // Get filename without extension
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setNewNoteTitle({ ...newNoteTitle, [chapterId]: fileName });
      handleUploadNotes(chapterId, file);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const token = localStorage.getItem('token');
    
    const res = await fetch('/api/upload/thumbnail', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (res.ok) {
      const data = await res.json();
      setCourse({ ...course, thumbnail: data.url });
    } else {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleUploadNotes = async (chapterId, file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    
    setNotesUploading(true);
    const formData = new FormData();
    formData.append('notes', file);
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/upload/notes', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        const title = newNoteTitle[chapterId] || 'Notes ' + ((course.chapters?.find(c => c._id === chapterId)?.notes?.length || 0) + 1);
        
        const saveRes = await fetch(`/api/courses/${id}/chapters/${chapterId}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, url: data.url })
        });
        
        if (saveRes.ok) {
          const updatedCourse = await saveRes.json();
          setCourse(updatedCourse);
          setNewNoteTitle({ ...newNoteTitle, [chapterId]: '' });
          alert('Notes uploaded successfully!');
        }
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    }
    setNotesUploading(false);
    setShowNotesForm('');
  };

  const handleAddGoogleDriveNote = async (chapterId) => {
    const url = newNoteUrl[chapterId]?.trim();
    if (!url) {
      alert('Please enter a Google Drive link');
      return;
    }

    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
      alert('Please enter a valid Google Drive or Google Docs link');
      return;
    }

    setNotesUploading(true);
    const token = localStorage.getItem('token');
    const title = newNoteTitle[chapterId] || 'Notes ' + ((course.chapters?.find(c => c._id === chapterId)?.notes?.length || 0) + 1);

    try {
      const saveRes = await fetch(`/api/courses/${id}/chapters/${chapterId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, url })
      });

      if (saveRes.ok) {
        const updatedCourse = await saveRes.json();
        setCourse(updatedCourse);
        setNewNoteTitle({ ...newNoteTitle, [chapterId]: '' });
        setNewNoteUrl({ ...newNoteUrl, [chapterId]: '' });
        alert('Google Drive note added successfully!');
      } else {
        alert('Failed to add note');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add note');
    }
    setNotesUploading(false);
    setShowNotesForm('');
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    if (id) {
      const token = localStorage.getItem('token');
      fetch(`/api/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setCourse(data);
          setLoading(false);
        });
    }
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!course.title || !course.description) {
      alert('Please fill in title and description');
      return;
    }
    setSaving(true);
    const token = localStorage.getItem('token');
    const url = id ? `/api/courses/${id}` : '/api/courses';
    const method = id ? 'PUT' : 'POST';
    
    console.log('Saving course:', { url, method, course });
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(course)
    });
    
    console.log('Response:', res.status, res.statusText);
    
    if (res.ok) {
      const data = await res.json();
      console.log('Course saved:', data);
      if (!id) {
        navigate(`/admin/courses/${data._id}/edit`);
      } else {
        setCourse(data);
        alert('Course saved successfully!');
      }
    } else {
      const text = await res.text();
      console.error('Error response:', text);
      try {
        const error = JSON.parse(text);
        alert('Error: ' + error.message);
      } catch (e) {
        alert('Error: ' + text);
      }
    }
    setSaving(false);
  };

  const handleAddChapter = async () => {
    if (!newChapter.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: newChapter })
    });
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
      setNewChapter('');
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Delete this chapter and all its videos?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.title || !newVideo.youtubeUrl) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters/${newVideo.chapterId}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newVideo)
    });
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
      setNewVideo({ chapterId: '', title: '', youtubeUrl: '' });
      setShowVideoForm('');
    }
  };

  const handleDeleteVideo = async (chapterId, videoId) => {
    if (!confirm('Delete this video?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
    }
  };

  const handleDeleteSingleNote = async (chapterId, noteId) => {
    if (!confirm('Delete this note?')) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const updatedCourse = await res.json();
        setCourse(updatedCourse);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete note');
    }
  };

  const handleDeleteNotes = async (chapterId) => {
    if (!confirm('Delete notes for this chapter?')) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: '' })
      });
      
      if (res.ok) {
        const updatedCourse = await res.json();
        setCourse(updatedCourse);
        alert('Notes deleted successfully!');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete notes');
    }
    setShowNotesForm('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6 mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {id ? 'Edit Course' : 'Create New Course'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
        >
          {saving ? 'Saving...' : 'Save Course'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Course Details</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={course.title}
                  onChange={e => setCourse({ ...course, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={course.description}
                  onChange={e => setCourse({ ...course, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                  placeholder="Course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {uploading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploading...</p>}
                {course.thumbnail && (
                  <div className="mt-2">
                    <img src={course.thumbnail} alt="Thumbnail" className="h-20 w-auto rounded" />
                    <button
                      type="button"
                      onClick={() => setCourse({ ...course, thumbnail: '' })}
                      className="text-red-600 text-sm mt-1 block"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price (BDT)</label>
                <input
                  type="number"
                  value={course.price}
                  onChange={e => setCourse({ ...course, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={course.category}
                  onChange={e => setCourse({ ...course, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="default">Default</option>
                  <option value="latest">Latest</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Chapters</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newChapter}
                onChange={e => setNewChapter(e.target.value)}
                placeholder="Chapter title"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddChapter}
                disabled={!id || !newChapter.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Add Chapter
              </button>
            </div>
            {!id && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Save course first before adding chapters.</p>
            )}
            <div className="space-y-4">
              {course.chapters?.map((chapter, index) => (
                <div key={chapter._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                    <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                      Chapter: {chapter.title}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setShowNotesForm(showNotesForm === chapter._id ? '' : chapter._id)}
                        className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                      >
                        + Add Notes
                      </button>
                      <button
                        onClick={() => setShowVideoForm(chapter._id)}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                      >
                        + Add Video
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter._id)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Show existing notes */}
                  {chapter.notes && chapter.notes.length > 0 && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Uploaded Notes:</p>
                      <div className="space-y-2">
                        {chapter.notes.map((note, noteIndex) => (
                          <div key={noteIndex} className="flex justify-between items-center bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-600">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">{note.title || 'Notes ' + (noteIndex + 1)}</span>
                            <button
                              onClick={() => handleDeleteSingleNote(chapter._id, note._id)}
                              className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {showNotesForm === chapter._id && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-3 border border-green-200 dark:border-green-800">
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Notes Title</label>
                        <input
                          type="text"
                          placeholder="e.g., Lecture Notes, Summary, Exercise"
                          value={newNoteTitle[chapter._id] || ''}
                          onChange={(e) => setNewNoteTitle({ ...newNoteTitle, [chapter._id]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-4">
                        {/* PDF Upload Option */}
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Option 1: Upload PDF (auto-detects filename)</label>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const fileName = file.name.replace(/\.[^/.]+$/, '');
                                setNewNoteTitle({ ...newNoteTitle, [chapter._id]: fileName });
                                handleUploadNotes(chapter._id, file);
                              }
                            }}
                            disabled={notesUploading}
                            className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-100 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-300 file:cursor-pointer file:transition file:hover:bg-violet-200 dark:file:hover:bg-violet-800"
                          />
                        </div>

                        <div className="flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">OR</span>
                        </div>

                        {/* Google Drive Link Option */}
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Option 2: Google Drive Link (auto-detects name)</label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="Paste Google Drive or Docs link here..."
                              value={newNoteUrl[chapter._id] || ''}
                              onChange={(e) => handleNoteUrlChange(e, chapter._id)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <button
                              onClick={() => handleAddGoogleDriveNote(chapter._id)}
                              disabled={notesUploading}
                              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {notesUploading && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Processing...</p>}
                    </div>
                  )}

                  {showVideoForm === chapter._id && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded mb-3">
                      <input
                        type="text"
                        placeholder="Video title (auto-detected from YouTube)"
                        value={newVideo.title}
                        onChange={e => setNewVideo({ ...newVideo, title: e.target.value, chapterId: chapter._id })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="YouTube URL (auto-detects video title)"
                        value={newVideo.youtubeUrl}
                        onChange={handleYoutubeUrlChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleAddVideo}
                        disabled={!newVideo.youtubeUrl}
                        className="bg-blue-600 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Add Video
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {chapter.videos?.map((video, vIndex) => (
                      <div key={video._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {index + 1}.{vIndex + 1} {video.title}
                        </span>
                        <button
                          onClick={() => handleDeleteVideo(chapter._id, video._id)}
                          className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Preview</h2>
            {course.thumbnail && (
              <img src={course.thumbnail} alt="Preview" className="w-full h-40 object-cover rounded mb-4" />
            )}
            <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{course.title || 'Course Title'}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{course.description || 'Course description...'}</p>
            <p className="text-blue-600 dark:text-blue-400 font-bold">
              {course.price === 0 ? 'Free' : `BDT ${course.price}`}
            </p>
            <div className="mt-4">
              <span className={`px-2 py-1 text-xs rounded ${course.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminCourseForm;
