import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  Calendar,
  DollarSign,
  Clock,
  Send,
  Star,
  AlertCircle,
} from 'lucide-react';

interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  required_skills: string[];
  experience_level: string;
  status: string;
  created_at: string;
  client_id: string;
  category: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    email: string;
  };
}

interface ProposalForm {
  price: number;
  delivery_time: string;
  cover_letter: string;
}

const initialProposalForm: ProposalForm = {
  price: 0,
  delivery_time: '',
  cover_letter: '',
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectRequest | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState<ProposalForm>(initialProposalForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from('project_requests')
        .select(`
          *,
          category:service_categories(
            id,
            name
          ),
          client:profiles!project_requests_client_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch proposals if user is the client
      if (user?.id === projectData.client_id) {
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('project_proposals')
          .select(`
            *,
            provider:provider_id(
              id,
              email
            )
          `)
          .eq('project_id', id);

        if (proposalsError) throw proposalsError;
        setProposals(proposalsData);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: proposalError } = await supabase
        .from('project_proposals')
        .insert({
          project_id: id,
          provider_id: user.id,
          ...proposalForm,
        });

      if (proposalError) throw proposalError;

      setShowProposalForm(false);
      setProposalForm(initialProposalForm);
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setError('Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    navigate('/services');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted {new Date(project.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Budget: ${project.budget_min} - ${project.budget_max}
              </span>
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Due by {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Project Description</h2>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {project.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {user?.id !== project.client_id && project.status === 'open' && (
            <div className="border-t pt-6">
              {!showProposalForm ? (
                <button
                  onClick={() => setShowProposalForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Proposal
                </button>
              ) : (
                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Submit Your Proposal</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Your Price
                    </label>
                    <input
                      type="number"
                      value={proposalForm.price}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      required
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Time
                    </label>
                    <input
                      type="text"
                      value={proposalForm.delivery_time}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, delivery_time: e.target.value }))}
                      required
                      placeholder="e.g., 5 days"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cover Letter
                    </label>
                    <textarea
                      value={proposalForm.cover_letter}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, cover_letter: e.target.value }))}
                      required
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Explain why you're the best fit for this project..."
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowProposalForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {user?.id === project.client_id && proposals.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposals</h2>
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{proposal.provider.email}</p>
                        <p className="text-sm text-gray-500">
                          Delivery Time: {proposal.delivery_time}
                        </p>
                      </div>
                      <p className="font-medium text-lg">${proposal.price}</p>
                    </div>
                    <p className="text-gray-600">{proposal.cover_letter}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 