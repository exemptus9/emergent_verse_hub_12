import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import { adminApi, taxonomyApi } from '../../services/api';
import TagSelect from '../../components/TagSelect';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';

const AdminPoemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    categories: [],
    tags: [],
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    author: 'rhymemosaic',
    isAnnouncement: false,
    amazonLink: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, tags] = await Promise.all([
          taxonomyApi.getCategories(),
          taxonomyApi.getTags(),
        ]);
        setAllCategories(cats.map(c => c.name));
        setAllTags(tags.map(t => t.name));
      } catch (err) {

      }

      if (isEditing) {
        try {
          const poem = await adminApi.getPoem(id);
          setFormData({
            title: poem.title || '',
            slug: poem.slug || '',
            content: poem.content || '',
            categories: poem.categories || [],
            tags: poem.tags || [],
            date: poem.date || '',
            author: poem.author || 'rhymemosaic',
            isAnnouncement: poem.isAnnouncement || false,
            amazonLink: poem.amazonLink || '',
          });
        } catch (err) {

          setError('Failed to load poem');
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [id, isEditing]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const poemData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        categories: formData.categories,
        tags: formData.tags,
        date: formData.date,
        author: formData.author,
        isAnnouncement: formData.isAnnouncement,
        amazonLink: formData.amazonLink || null,
      };

      if (isEditing) {
        await adminApi.updatePoem(id, poemData);
      } else {
        await adminApi.createPoem(poemData);
      }

      navigate('/admin/poems');
    } catch (err) {

      setError(err.response?.data?.detail || 'Failed to save poem');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white rounded-lg p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/poems')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Poem' : 'Create New Poem'}
          </h2>
        </div>
        {isEditing && formData.slug && (
          <a
            href={`/poem/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#1e73be] hover:underline"
          >
            <Eye className="w-4 h-4" />
            Preview
          </a>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter poem title"
              required
              className="mt-1"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="poem-url-slug"
              required
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (auto-generated from title)</p>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your poem here..."
              required
              rows={12}
              className="mt-1 font-serif"
            />
          </div>

          {/* Categories & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TagSelect
              label="Categories"
              selected={formData.categories}
              options={allCategories}
              onChange={(cats) => setFormData(prev => ({ ...prev, categories: cats }))}
              placeholder="Select or create categories..."
            />
            <TagSelect
              label="Tags"
              selected={formData.tags}
              options={allTags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags: tags }))}
              placeholder="Select or create tags..."
            />
          </div>

          {/* Date & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date">Display Date</Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                placeholder="January 1, 2024"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="rhymemosaic"
                className="mt-1"
              />
            </div>
          </div>

          {/* Announcement */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isAnnouncement"
              checked={formData.isAnnouncement}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnnouncement: checked }))}
            />
            <Label htmlFor="isAnnouncement" className="cursor-pointer">
              This is an announcement (shows Amazon link)
            </Label>
          </div>

          {/* Amazon Link */}
          {formData.isAnnouncement && (
            <div>
              <Label htmlFor="amazonLink">Amazon Link</Label>
              <Input
                id="amazonLink"
                value={formData.amazonLink}
                onChange={(e) => setFormData(prev => ({ ...prev, amazonLink: e.target.value }))}
                placeholder="https://a.co/d/..."
                className="mt-1"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/poems')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#1e73be] hover:bg-[#1a5fa0]"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Poem' : 'Create Poem'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminPoemForm;
