import React, { useState, useEffect } from "react";
import addressData from "./address_data.json";

interface LocationSelectorProps {
  state: string;
  district: string;
  village: string;
  className?: string;
  onChange: (field: "state" | "district" | "village", value: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  state,
  district,
  village,
  className,
  onChange,
}) => {
  const [selectedState, setSelectedState] = useState(state || "");
  const [selectedDistrict, setSelectedDistrict] = useState(district || "");
  const [selectedVillage, setSelectedVillage] = useState(village || "");

  // 🔹 Notify parent whenever selection changes
  useEffect(() => {
    if (onChange) {
      onChange("state", selectedState);
      onChange("district", selectedDistrict);
      onChange("village", selectedVillage);
    }
  }, [selectedState, selectedDistrict, selectedVillage]);

  return (
    <div className={className}>
      {/* State */}
      <label className="block mb-1">State</label>
      <select
        value={selectedState}
        onChange={(e) => {
          setSelectedState(e.target.value);
          setSelectedDistrict(""); // reset district when state changes
          setSelectedVillage(""); // reset village when state changes
        }}
        className="w-full border p-2 rounded"
      >
        <option value="">Select State</option>
        {Object.keys(addressData).map((stateName, idx) => (
          <option key={`${stateName}-${idx}`} value={stateName}>
            {stateName.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      {/* District */}
      {selectedState && (
        <>
          <label className="block mt-3 mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedVillage(""); // reset village when district changes
            }}
            className="w-full border p-2 rounded"
          >
            <option value="">Select District</option>
            {Object.keys(addressData[selectedState]).map((distName, idx) => (
              <option key={`${distName}-${idx}`} value={distName}>
                {distName.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Village */}
      {selectedDistrict && (
        <>
          <label className="block mt-3 mb-1">Village</label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Village</option>
            {addressData[selectedState][selectedDistrict].map(
              (villageName: string, idx: number) => (
                <option key={`${villageName}-${idx}`} value={villageName}>
                  {villageName.replace(/_/g, " ")}
                </option>
              ),
            )}
          </select>
        </>
      )}
    </div>
  );
};

export default LocationSelector;
