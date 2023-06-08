import React, { useState, useEffect } from "react";
import { FaPencilAlt, FaTrashAlt, FaSearch } from "react-icons/fa";
import {
  getRegions,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
} from "./api";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const App = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    const regionsData = await getRegions();
    setRegions(regionsData);
    setFilteredRegions(regionsData);
  };

  const handleAddRegion = async (region) => {
    await createRegion(region);
    fetchRegions();
    setIsFormOpen(false);
  };

  const handleEditRegion = async (regionId) => {
    const region = await getRegionById(regionId);
    setSelectedRegion(region);
    setIsFormOpen(true);
  };

  const handleUpdateRegion = async (updatedRegion) => {
    await updateRegion(updatedRegion);
    fetchRegions();
    setSelectedRegion(null);
    setIsFormOpen(false);
  };

  const handleDeleteRegion = async (regionId) => {
    await deleteRegion(regionId);
    fetchRegions();
    setSelectedRows([]);
  };

  const handleDeleteSelected = async () => {
    const regionIds = selectedRows.map(
      (index) => filteredRegions[index].region_id
    );
    await Promise.all(regionIds.map(deleteRegion));
    fetchRegions();
    setSelectedRows([]);
  };

  const toggleRowSelection = (index) => {
    const isSelected = selectedRows.includes(index);
    if (isSelected) {
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows.filter((row) => row !== index)
      );
    } else {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, index]);
    }
  };

  const toggleAllRowsSelection = () => {
    if (selectedRows.length === filteredRegions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(
        Array.from({ length: filteredRegions.length }, (_, i) => i)
      );
    }
  };

  const renderRegions = () => {
    return filteredRegions.map((region, index) => (
      <tr key={region.region_id}>
        <td>{index + 1}</td>
        <td>
          <input
            type="checkbox"
            checked={selectedRows.includes(index)}
            onChange={() => toggleRowSelection(index)}
          />
        </td>
        <td>
          <button
            className="region-name"
            onClick={() => handleRegionClick(region)}
          >
            {region.name}
          </button>
        </td>
        <td className="hide-column">{region.countries.join(", ")}</td>
        <td>
          <div
            className={`status-circle ${
              region.isActive ? "active" : "inactive"
            }`}
            title={region.isActive ? "Active" : "Not Active"}
          />
        </td>
        <td>
          <div className="action-icons">
            <button
              className="edit-button"
              onClick={() => handleEditRegion(region.region_id)}
            >
              <FaPencilAlt className="icon blue" title="Edit" />
            </button>
            <button
              className="delete-button"
              onClick={() => handleDeleteRegion(region.region_id)}
            >
              <FaTrashAlt className="icon red" title="Delete" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const handleNewRegion = () => {
    setSelectedRegion(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedRegion(null);
    setIsFormOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let filteredRegions = regions;
    if (searchTerm.trim() !== "") {
      filteredRegions = regions.filter((region) =>
        region.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRegions(filteredRegions);
  };

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedRegion(null);
    setIsModalOpen(false);
  };

  return (
    <div className="App">
      <h1>Regions</h1>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Search by region name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className={`search-button ${
            searchTerm.trim() !== "" ? "active" : ""
          }`}
          type="submit"
        >
          <FaSearch />
        </button>
      </form>

      <div className="table-buttons">
        <button className="new-region-button" onClick={handleNewRegion}>
          Add Region
        </button>
        <button
          className="delete-selected-button"
          onClick={handleDeleteSelected}
          disabled={selectedRows.length === 0}
        >
          Delete Selected
        </button>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th></th>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === filteredRegions.length}
                onChange={toggleAllRowsSelection}
              />
            </th>
            <th>Name</th>
            <th className="hide-column">Countries</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderRegions()}</tbody>
      </table>

      {isFormOpen && (
        <RegionForm
          region={selectedRegion}
          onAddRegion={handleAddRegion}
          onUpdateRegion={handleUpdateRegion}
          onClose={handleCloseForm}
        />
      )}

      {isModalOpen && (
        <RegionModal region={selectedRegion} onClose={handleModalClose} />
      )}
    </div>
  );
};

const RegionForm = ({ region, onAddRegion, onUpdateRegion, onClose }) => {
  const [name, setName] = useState("");
  const [countries, setCountries] = useState([]);
  const [status, setStatus] = useState("active"); // "active" or "inactive"

  useEffect(() => {
    if (region) {
      setName(region.name);
      setCountries(region.countries);
      setStatus(region.isActive ? "active" : "inactive");
    }
  }, [region]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newRegion = {
      region_id: region ? region.region_id : uuidv4(),
      name,
      countries,
      isActive: status === "active",
    };
    if (region) {
      onUpdateRegion(newRegion);
    } else {
      onAddRegion(newRegion);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{region ? "Edit Region" : "Add New Region"}</h2>
        <button type="button" onClick={onClose} className="close">
          &times;
        </button>
        <hr />
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="countries">Countries:</label>
            <textarea
              id="countries"
              value={countries.join(", ")}
              onChange={(e) => setCountries(e.target.value.split(", "))}
              rows={3}
            ></textarea>
          </div>

          <div className="form-group last-form">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Not Active</option>
            </select>
          </div>
          <hr />
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="red-btn">
              Cancel
            </button>
            <button type="submit" className={region ? "blue-btn" : "green-btn"}>
              {region ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegionModal = ({ region, onClose }) => {
  const { name, countries, isActive } = region;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{name}</h2>
        <button type="button" onClick={onClose} className="close">
          &times;
        </button>
        <hr />
        <div className="form-group view">
          <label htmlFor="countries">Countries:</label>
          <p className="country-name">{countries.join(", ")}</p>
        </div>
        <hr />
        <div className="form-group view">
          <label htmlFor="status">Status:</label>
          <p className={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Not Active"}
          </p>
        </div>
        <div className="modal-buttons center">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
