import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Film, Tv } from "lucide-react";
import { FileMetadata } from "../types";

interface EditViewProps {
    file: FileMetadata;
    onSave: (updatedFile: FileMetadata) => void;
    onCancel: () => void;
}

export const EditView: React.FC<EditViewProps> = ({ file, onSave, onCancel }) => {
    const [type, setType] = useState<"tv" | "movie">(file.type || "tv");
    const [series, setSeries] = useState(file.series || "");
    const [season, setSeason] = useState<number | string>(file.season || 1);
    const [episode, setEpisode] = useState<number | string>(file.episode || 1);

    useEffect(() => {
        setType(file.type || "tv");
        setSeries(file.series || "");
        setSeason(file.season || 1);
        setEpisode(file.episode || 1);
    }, [file]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onCancel]);

    const handleSave = () => {
        const numSeason = typeof season === "string" ? parseInt(season) : season;
        const numEpisode = typeof episode === "string" ? parseInt(episode) : episode;

        const updated: FileMetadata = {
            ...file,
            type,
            series,
            season: type === "tv" ? numSeason : null,
            episode: type === "tv" ? numEpisode : null
        };
        onSave(updated);
    };

    return (
        <div className="view-container">
            <div className="edit-view">
                <header className="edit-view-header">
                    <button
                        className="edit-view-back"
                        onClick={onCancel}
                        aria-label="Go back to queue"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <h2 className="edit-view-title">Edit: {file.originalName}</h2>
                </header>

                <div className="edit-view-form">
                    <div className="form-group">
                        <label className="form-label">
                            {type === "movie" ? <Film size={14} /> : <Tv size={14} />}
                            Type
                        </label>
                        <div className="form-type-toggle">
                            <label className="form-type-option">
                                <input
                                    type="radio"
                                    name="type"
                                    value="tv"
                                    checked={type === "tv"}
                                    onChange={() => setType("tv")}
                                />
                                TV Show
                            </label>
                            <label className="form-type-option">
                                <input
                                    type="radio"
                                    name="type"
                                    value="movie"
                                    checked={type === "movie"}
                                    onChange={() => setType("movie")}
                                />
                                Movie
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="series">
                            Title / Series
                        </label>
                        <input
                            id="series"
                            className="input-field"
                            type="text"
                            value={series}
                            onChange={(e) => setSeries(e.target.value)}
                            placeholder="Enter title or series name"
                        />
                    </div>

                    {type === "tv" && (
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="season">
                                    Season
                                </label>
                                <input
                                    id="season"
                                    className="input-field"
                                    type="number"
                                    min="1"
                                    value={season}
                                    onChange={(e) => setSeason(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="episode">
                                    Episode
                                </label>
                                <input
                                    id="episode"
                                    className="input-field"
                                    type="number"
                                    min="1"
                                    value={episode}
                                    onChange={(e) => setEpisode(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button className="btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSave}>
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
