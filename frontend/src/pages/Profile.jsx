import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  AtSign,
  Edit3,
  Save,
  X,
  RefreshCw,
  Lock,
  Activity,
  FileSearch,
  Users,
  Briefcase,
} from "lucide-react";

import api from "../services/api";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    cases: 0,
    investigations: 0,
    evidence: 0,
    suspects: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    bio: "",
    role: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          profileResponse,
          casesResponse,
          investigationsResponse,
          evidenceResponse,
          suspectsResponse,
        ] = await Promise.all([
          api.get("/auth/me/"),
          api.get("/cases/"),
          api.get("/investigations/"),
          api.get("/evidence/"),
          api.get("/suspects/"),
        ]);

        const user = profileResponse.data;

        setProfile(user);

        setFormData({
          display_name: user.profile?.display_name || "",
          email: user.email || "",
          bio: user.profile?.bio || "",
          role: user.profile?.role || "",
        });

        const cases = Array.isArray(casesResponse.data)
          ? casesResponse.data
          : casesResponse.data.results || [];

        const investigations = Array.isArray(
          investigationsResponse.data
        )
          ? investigationsResponse.data
          : investigationsResponse.data.results || [];

        const evidence = Array.isArray(evidenceResponse.data)
          ? evidenceResponse.data
          : evidenceResponse.data.results || [];

        const suspects = Array.isArray(suspectsResponse.data)
          ? suspectsResponse.data
          : suspectsResponse.data.results || [];

        setStats({
          cases: cases.length,
          investigations: investigations.length,
          evidence: evidence.length,
          suspects: suspects.length,
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [
        profileResponse,
        casesResponse,
        investigationsResponse,
        evidenceResponse,
        suspectsResponse,
      ] = await Promise.all([
        api.get("/auth/me/"),
        api.get("/cases/"),
        api.get("/investigations/"),
        api.get("/evidence/"),
        api.get("/suspects/"),
      ]);

      const user = profileResponse.data;

      setProfile(user);

      setFormData({
        display_name: user.profile?.display_name || "",
        email: user.email || "",
        bio: user.profile?.bio || "",
        role: user.profile?.role || "",
      });

      const cases = Array.isArray(casesResponse.data)
        ? casesResponse.data
        : casesResponse.data.results || [];

      const investigations = Array.isArray(
        investigationsResponse.data
      )
        ? investigationsResponse.data
        : investigationsResponse.data.results || [];

      const evidence = Array.isArray(evidenceResponse.data)
        ? evidenceResponse.data
        : evidenceResponse.data.results || [];

      const suspects = Array.isArray(suspectsResponse.data)
        ? suspectsResponse.data
        : suspectsResponse.data.results || [];

      setStats({
        cases: cases.length,
        investigations: investigations.length,
        evidence: evidence.length,
        suspects: suspects.length,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to refresh profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.patch("/auth/me/", {
        email: formData.email,
        display_name: formData.display_name,
        bio: formData.bio,
        role: formData.role,
      });

      setProfile(response.data);

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Unable to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.profile?.display_name) {
      return profile.profile.display_name;
    }

    if (profile?.username) {
      return profile.username;
    }

    return "Investigator";
  };

  const getInitial = () => {
    return getDisplayName().charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <p>Loading investigator profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-grid"></div>

      <div className="profile-container">
        <header className="profile-header">
          <div>
            <div className="profile-eyebrow">
              <Shield size={16} />
              INVESTIGATOR IDENTITY
            </div>

            <h1>My Profile</h1>

            <p>
              Manage your investigator identity and review your
              activity across Digital Detective.
            </p>
          </div>

          <button
            className="profile-refresh-btn"
            onClick={refreshProfile}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="profile-error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="profile-success">
            <span>{success}</span>

            <button onClick={() => setSuccess("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <section className="profile-hero">
          <div className="profile-avatar">
            {getInitial()}
          </div>

          <div className="profile-hero-info">
            <div className="profile-status">
              <span className="profile-status-dot"></span>
              ACTIVE INVESTIGATOR
            </div>

            <h2>{getDisplayName()}</h2>

            <p>@{profile?.username || "investigator"}</p>

            <div className="profile-role">
              <Shield size={15} />
              {profile?.profile?.role || "Investigator"}
            </div>
          </div>

          <div className="profile-hero-action">
            {!editing && (
              <button
                className="profile-edit-btn"
                onClick={() => {
                  setEditing(true);
                  setSuccess("");
                }}
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            )}
          </div>
        </section>

        <section className="profile-stats">
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Briefcase size={21} />
            </div>

            <div>
              <span>Cases</span>
              <strong>{stats.cases}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <FileSearch size={21} />
            </div>

            <div>
              <span>Investigations</span>
              <strong>{stats.investigations}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Activity size={21} />
            </div>

            <div>
              <span>Evidence</span>
              <strong>{stats.evidence}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Users size={21} />
            </div>

            <div>
              <span>Suspects</span>
              <strong>{stats.suspects}</strong>
            </div>
          </div>
        </section>

        <div className="profile-content">
          <section className="profile-panel">
            <div className="profile-panel-header">
              <div>
                <span>IDENTITY RECORD</span>
                <h2>Personal Information</h2>
              </div>

              <User size={21} />
            </div>

            {editing ? (
              <form
                className="profile-form"
                onSubmit={handleSave}
              >
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label>Display Name</label>

                    <div className="profile-input">
                      <User size={17} />

                      <input
                        type="text"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleChange}
                        placeholder="Enter display name"
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Email Address</label>

                    <div className="profile-input">
                      <Mail size={17} />

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Role</label>

                    <div className="profile-input">
                      <Shield size={17} />

                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="">
                          Select role
                        </option>
                        <option value="Investigator">
                          Investigator
                        </option>
                        <option value="Analyst">
                          Analyst
                        </option>
                        <option value="Researcher">
                          Researcher
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Username</label>

                    <div className="profile-input profile-disabled">
                      <AtSign size={17} />

                      <input
                        type="text"
                        value={profile?.username || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-form-group">
                  <label>Investigator Bio</label>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Write a short investigator bio..."
                    rows="5"
                  ></textarea>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={() => {
                      setEditing(false);

                      setFormData({
                        display_name:
                          profile?.profile?.display_name || "",
                        email: profile?.email || "",
                        bio: profile?.profile?.bio || "",
                        role: profile?.profile?.role || "",
                      });
                    }}
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-information">
                <div className="profile-info-row">
                  <div className="profile-info-icon">
                    <User size={17} />
                  </div>

                  <div>
                    <span>Display Name</span>
                    <strong>{getDisplayName()}</strong>
                  </div>
                </div>

                <div className="profile-info-row">
                  <div className="profile-info-icon">
                    <AtSign size={17} />
                  </div>

                  <div>
                    <span>Username</span>
                    <strong>
                      @{profile?.username || "unknown"}
                    </strong>
                  </div>
                </div>

                <div className="profile-info-row">
                  <div className="profile-info-icon">
                    <Mail size={17} />
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>
                      {profile?.email || "No email provided"}
                    </strong>
                  </div>
                </div>

                <div className="profile-info-row">
                  <div className="profile-info-icon">
                    <Shield size={17} />
                  </div>

                  <div>
                    <span>Investigator Role</span>
                    <strong>
                      {profile?.profile?.role ||
                        "Investigator"}
                    </strong>
                  </div>
                </div>

                <div className="profile-bio">
                  <span>INVESTIGATOR BIO</span>

                  <p>
                    {profile?.profile?.bio ||
                      "No investigator bio has been added yet."}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="profile-panel profile-security-panel">
            <div className="profile-panel-header">
              <div>
                <span>SECURITY STATUS</span>
                <h2>Account Security</h2>
              </div>

              <Lock size={21} />
            </div>

            <div className="security-item">
              <div className="security-icon">
                <Shield size={18} />
              </div>

              <div>
                <strong>JWT Authentication</strong>
                <p>
                  Your session is protected using token-based
                  authentication.
                </p>
              </div>

              <span className="security-active">
                ACTIVE
              </span>
            </div>

            <div className="security-item">
              <div className="security-icon">
                <Lock size={18} />
              </div>

              <div>
                <strong>Protected API Access</strong>
                <p>
                  Investigation data requires an authenticated
                  account.
                </p>
              </div>

              <span className="security-active">
                ENABLED
              </span>
            </div>

            <div className="security-item">
              <div className="security-icon">
                <Activity size={18} />
              </div>

              <div>
                <strong>Activity Tracking</strong>
                <p>
                  Your investigation activity is associated
                  with your account.
                </p>
              </div>

              <span className="security-active">
                ACTIVE
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;