import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Trash2, Upload, FileText, Play, X, ArrowLeft, Loader2, Check, Image, Link2 } from 'lucide-react';

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
  const [newVideo, setNewVideo] = useState({ chapterId: '', title: '', youtubeUrl: '' });
  const [showVideoForm, setShowVideoForm] = useState('');
  const [showNotesForm, setShowNotesForm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notesUploading, setNotesUploading] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState({});
  const [newNoteUrl, setNewNoteUrl] = useState({});

  const getYouTubeTitle = async (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) return '';
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      return data.title || '';
    } catch (e) { return ''; }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeUrlChange = async (e) => {
    const url = e.target.value;
    const videoId = extractVideoId(url);
    if (videoId) {
      const title = await getYouTubeTitle(url);
      setNewVideo({ ...newVideo, youtubeUrl: url, title: title || `Video ${videoId}` });
    } else {
      setNewVideo({ ...newVideo, youtubeUrl: url });
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
        const title = newNoteTitle[chapterId] || 'Notes';
        const saveRes = await fetch(`/api/courses/${id}/chapters/${chapterId}/notes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title, url: data.url })
        });
        if (saveRes.ok) {
          const updatedCourse = await saveRes.json();
          setCourse(updatedCourse);
        }
      }
    } catch (error) { console.error(error); }
    setNotesUploading(false);
    setShowNotesForm('');
  };

  const handleAddGoogleDriveNote = async (chapterId) => {
    const url = newNoteUrl[chapterId]?.trim();
    if (!url || !url.includes('drive.google.com') && !url.includes('docs.google.com')) {
      alert('Please enter a valid Google Drive link');
      return;
    }
    setNotesUploading(true);
    const token = localStorage.getItem('token');
    const title = newNoteTitle[chapterId] || 'Notes';
    try {
      const saveRes = await fetch(`/api/courses/${id}/chapters/${chapterId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, url })
      });
      if (saveRes.ok) {
        const updatedCourse = await saveRes.json();
        setCourse(updatedCourse);
      }
    } catch (error) { console.error(error); }
    setNotesUploading(false);
    setShowNotesForm('');
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    if (id) {
      const token = localStorage.getItem('token');
      fetch(`/api/courses/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setCourse(data); setLoading(false); });
    }
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!course.title || !course.description) { alert('Please fill in title and description'); return; }
    setSaving(true);
    const token = localStorage.getItem('token');
    const url = id ? `/api/courses/${id}` : '/api/courses';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(course)
    });
    if (res.ok) {
      const data = await res.json();
      if (!id) navigate(`/admin/courses/${data._id}/edit`);
      else setCourse(data);
    }
    setSaving(false);
  };

  const handleAddChapter = async () => {
    if (!newChapter.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: newChapter })
    });
    if (res.ok) { const data = await res.json(); setCourse(data); setNewChapter(''); }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Delete this chapter?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters/${chapterId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { const data = await res.json(); setCourse(data); }
  };

  const handleAddVideo = async () => {
    if (!newVideo.youtubeUrl) { alert('Please enter a YouTube URL'); return; }
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters/${newVideo.chapterId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: newVideo.title || 'Untitled Video', youtubeUrl: newVideo.youtubeUrl })
    });
    if (res.ok) { const data = await res.json(); setCourse(data); setNewVideo({ chapterId: '', title: '', youtubeUrl: '' }); setShowVideoForm(''); }
  };

  const handleDeleteVideo = async (chapterId, videoId) => {
    if (!confirm('Delete this video?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/videos/${videoId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { const data = await res.json(); setCourse(data); }
  };

  const handleDeleteSingleNote = async (chapterId, noteId) => {
    if (!confirm('Delete this note?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/chapters/${chapterId}/notes/${noteId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { const data = await res.json(); setCourse(data); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {id ? 'Edit Course' : 'Create New Course'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Fill in course details and add content</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                Course Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={course.title}
                    onChange={e => setCourse({ ...course, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Course title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={course.description}
                    onChange={e => setCourse({ ...course, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white h-32 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Course description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Thumbnail</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50 transition cursor-pointer">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                    </label>
                    {course.thumbnail && (
                      <div className="relative">
                        <img src={course.thumbnail} alt="Thumbnail" className="h-16 w-24 object-cover rounded-xl" />
                        <button onClick={() => setCourse({ ...course, thumbnail: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Price (BDT)</label>
                    <input
                      type="number"
                      value={course.price}
                      onChange={e => setCourse({ ...course, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={course.category}
                      onChange={e => setCourse({ ...course, category: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="default">Default</option>
                      <option value="latest">Latest</option>
                      <option value="popular">Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-500" />
                Chapters & Videos
              </h2>
              
              {/* Add Chapter */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newChapter}
                  onChange={e => setNewChapter(e.target.value)}
                  placeholder="Chapter title"
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleAddChapter}
                  disabled={!id || !newChapter.trim()}
                  className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium disabled:opacity-50 transition cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {!id && <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">⚠️ Save course first before adding chapters.</p>}

              {/* Chapter List */}
              <div className="space-y-4">
                {course.chapters?.map((chapter, index) => (
                  <div key={chapter._id} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {index + 1}. {chapter.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setShowNotesForm(showNotesForm === chapter._id ? '' : chapter._id)} className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition cursor-pointer">
                          + Notes
                        </button>
                        <button onClick={() => { setShowVideoForm(chapter._id); setNewVideo({ ...newVideo, chapterId: chapter._id }); }} className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition cursor-pointer">
                          + Video
                        </button>
                        <button onClick={() => handleDeleteChapter(chapter._id)} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {chapter.notes?.length > 0 && (
                      <div className="p-4 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Notes:</p>
                        <div className="space-y-2">
                          {chapter.notes.map((note, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">
                              <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">{note.title}</span>
                              <button onClick={() => handleDeleteSingleNote(chapter._id, note._id)} className="text-red-500 hover:text-red-700 text-xs ml-2 cursor-pointer">Delete</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showNotesForm === chapter._id && (
                      <div className="p-4 border-t border-slate-200 dark:border-slate-600 bg-emerald-50 dark:bg-emerald-900/20">
                        <div className="mb-3">
                          <input type="text" placeholder="Note title" value={newNoteTitle[chapter._id] || ''} onChange={(e) => setNewNoteTitle({ ...newNoteTitle, [chapter._id]: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900" />
                        </div>
                        <div className="flex gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm cursor-pointer">
                            <Upload className="w-4 h-4" />
                            PDF
                            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { if (e.target.files[0]) { setNewNoteTitle({ ...newNoteTitle, [chapter._id]: e.target.files[0].name.replace(/\.[^/.]+$/, '') }); handleUploadNotes(chapter._id, e.target.files[0]); } }} />
                          </label>
                          <span className="flex items-center text-slate-400 text-sm">or</span>
                          <div className="flex-1 flex gap-2">
                            <input type="url" placeholder="Drive link..." value={newNoteUrl[chapter._id] || ''} onChange={(e) => setNewNoteUrl({ ...newNoteUrl, [chapter._id]: e.target.value })} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900" />
                            <button onClick={() => handleAddGoogleDriveNote(chapter._id)} className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm cursor-pointer">Add</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Form */}
                    {showVideoForm === chapter._id && (
                      <div className="p-4 border-t border-slate-200 dark:border-slate-600 bg-violet-50 dark:bg-violet-900/20">
                        <input type="text" placeholder="Video title" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 mb-2" />
                        <div className="flex gap-2">
                          <input type="url" placeholder="YouTube URL" value={newVideo.youtubeUrl} onChange={handleYoutubeUrlChange} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900" />
                          <button onClick={handleAddVideo} disabled={!newVideo.youtubeUrl} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm disabled:opacity-50 cursor-pointer">Add</button>
                        </div>
                      </div>
                    )}

                    {/* Videos List */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-600 space-y-2">
                      {chapter.videos?.map((video, vIndex) => (
                        <div key={video._id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">{index + 1}.{vIndex + 1} {video.title}</span>
                          <button onClick={() => handleDeleteVideo(chapter._id, video._id)} className="text-red-500 hover:text-red-700 text-xs ml-2 cursor-pointer">Delete</button>
                        </div>
                      ))}
                      {chapter.videos?.length === 0 && <p className="text-sm text-slate-400">No videos yet</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Image className="w-5 h-5 text-violet-600" />
                Preview
              </h2>
              {course.thumbnail && (
                <img src={course.thumbnail} alt="Preview" className="w-full h-40 object-cover rounded-xl mb-4" />
              )}
              <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">{course.title || 'Course Title'}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{course.description || 'Course description...'}</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-4">{course.price === 0 ? 'Free' : `BDT ${course.price}`}</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${course.isPublished ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminCourseForm;