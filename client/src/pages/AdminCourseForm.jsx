import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminCourseForm = () => {
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
  const [uploading, setUploading] = useState(false);

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
    }
    setUploading(false);
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
    setSaving(true);
    const token = localStorage.getItem('token');
    const url = id ? `/api/courses/${id}` : '/api/courses';
    const method = id ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(course)
    });
    
    if (res.ok) {
      const data = await res.json();
      navigate(`/admin/courses/${data._id}/edit`);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id ? 'Edit Course' : 'Create New Course'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Course'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Course Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={course.title}
                  onChange={e => setCourse({ ...course, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={course.description}
                  onChange={e => setCourse({ ...course, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg h-24"
                  placeholder="Course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                {course.thumbnail && (
                  <div className="mt-2">
                    <img src={course.thumbnail} alt="Thumbnail" className="h-20 w-auto rounded" />
                    <button
                      type="button"
                      onClick={() => setCourse({ ...course, thumbnail: '' })}
                      className="text-red-600 text-sm mt-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (BDT)</label>
                <input
                  type="number"
                  value={course.price}
                  onChange={e => setCourse({ ...course, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Chapters</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newChapter}
                onChange={e => setNewChapter(e.target.value)}
                placeholder="Chapter title"
                className="flex-1 px-4 py-2 border rounded-lg"
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
              <p className="text-sm text-gray-500 mb-4">Save course first before adding chapters.</p>
            )}
            <div className="space-y-4">
              {course.chapters?.map((chapter, index) => (
                <div key={chapter._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">
                      Chapter {index + 1}: {chapter.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowVideoForm(chapter._id)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        + Add Video
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter._id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {showVideoForm === chapter._id && (
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <input
                        type="text"
                        placeholder="Video title"
                        value={newVideo.title}
                        onChange={e => setNewVideo({ ...newVideo, title: e.target.value, chapterId: chapter._id })}
                        className="w-full px-3 py-2 border rounded mb-2"
                      />
                      <input
                        type="text"
                        placeholder="YouTube URL (e.g., https://youtu.be/xxx)"
                        value={newVideo.youtubeUrl}
                        onChange={e => setNewVideo({ ...newVideo, youtubeUrl: e.target.value, chapterId: chapter._id })}
                        className="w-full px-3 py-2 border rounded mb-2"
                      />
                      <button
                        onClick={handleAddVideo}
                        className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                      >
                        Add Video
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {chapter.videos?.map((video, vIndex) => (
                      <div key={video._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          {index + 1}.{vIndex + 1} {video.title}
                        </span>
                        <button
                          onClick={() => handleDeleteVideo(chapter._id, video._id)}
                          className="text-red-600 text-sm hover:underline"
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
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            {course.thumbnail && (
              <img src={course.thumbnail} alt="Preview" className="w-full h-40 object-cover rounded mb-4" />
            )}
            <h3 className="font-bold text-xl mb-2">{course.title || 'Course Title'}</h3>
            <p className="text-gray-600 text-sm mb-2">{course.description || 'Course description...'}</p>
            <p className="text-blue-600 font-bold">
              {course.price === 0 ? 'Free' : `BDT ${course.price}`}
            </p>
            <div className="mt-4">
              <span className={`px-2 py-1 text-xs rounded ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseForm;
