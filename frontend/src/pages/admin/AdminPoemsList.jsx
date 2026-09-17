import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Star, MessageSquare, ExternalLink } from 'lucide-react';
import { poemsApi, adminApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const AdminPoemsList = () => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPoems = async () => {
    try {
      const data = await poemsApi.getAll('newest');
      setPoems(data);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deletePoem(deleteId);
      setPoems(poems.filter(p => p.id !== deleteId));
    } catch (err) {

    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white rounded-lg p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Poems ({poems.length})</h2>
        <Link
          to="/admin/poems/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1e73be] text-white rounded-lg hover:bg-[#1a5fa0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Poem
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Date</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Rating</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Comments</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {poems.map((poem) => (
              <tr key={poem.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-800 line-clamp-1">{poem.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{poem.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{poem.date}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm">{poem.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-400">({poem.ratingCount || 0})</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{poem.comments || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/poem/${poem.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/admin/poems/edit/${poem.id}`}
                      className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(poem.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poem?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this poem along with all its ratings and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPoemsList;
