import React, { useState } from "react";
import axios from "axios";

const PolicyForm = () => {
    const [policy, setPolicy] = useState({
        policy_id: "",
        policy_desc: "",
        policy_version: "",
        policy_rules: [
          {
            rule_id: "",
            effect: "enable",
            authorized_users: [""],
            resource: [""],
            context_constraints: {
              user_role: [""],
              date_period: { start_date: "", end_date: "" },
              time_period: { start_time: "", end_time: "" },
              weekdays: [""],
              location_range: { latitude: "", longitude: "", radius: "" },
              place: [""],
              device: [{ id: "", type: "" }],
              authorized_ip: [""],
            },
            action: [""],
            permissions: "allow",
          },
        ],
        proof: [
          {
            type: "",
            created: "",
            creator: "",
            verificationMethod: "",
            policyRuleHash: "",
            signatureValue: "",
            status: "",
          },
        ],
      });
    
      const handleChange = (field, value) => {
        setPolicy((prevPolicy) => ({
          ...prevPolicy,
          [field]: value,
        }));
      };
    
      const handleNestedChange = (path, value) => {
        const keys = path.split(".");
        setPolicy((prevPolicy) => {
          const newPolicy = { ...prevPolicy };
          let current = newPolicy;
          for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
          return newPolicy;
        });
      };
    
      const addRule = () => {
        setPolicy((prevPolicy) => ({
          ...prevPolicy,
          policy_rules: [
            ...prevPolicy.policy_rules,
            {
              rule_id: "",
              effect: "enable",
              authorized_users: [""],
              resource: [""],
              context_constraints: {
                user_role: [""],
                date_period: { start_date: "", end_date: "" },
                time_period: { start_time: "", end_time: "" },
                weekdays: [""],
                location_range: { latitude: "", longitude: "", radius: "" },
                place: [""],
                device: [{ id: "", type: "" }],
                authorized_ip: [""],
              },
              action: [""],
              permissions: "allow",
            },
          ],
        }));
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          console.log(policy);
          const response = await axios.post("http://localhost:5000/addPolicy", policy);
          
          console.log("Policy added successfully:", response.data);
        } catch (error) {
          console.error("Error adding policy:", error);
        }
      };
    
      return (
        <form onSubmit={handleSubmit}>
          <h2>Add Policy</h2>
          <label>
            Policy ID:
            <input
              type="text"
              value={policy.policy_id}
              onChange={(e) => handleChange("policy_id", e.target.value)}
            />
          </label>
          <label>
            Policy Description:
            <input
              type="text"
              value={policy.policy_desc}
              onChange={(e) => handleChange("policy_desc", e.target.value)}
            />
          </label>
          <label>
            Policy Version:
            <input
              type="text"
              value={policy.policy_version}
              onChange={(e) => handleChange("policy_version", e.target.value)}
            />
          </label>
    
          <h3>Policy Rules</h3>
          {policy.policy_rules.map((rule, index) => (
            <div key={index}>
              <label>
                Rule ID:
                <input
                  type="text"
                  value={rule.rule_id}
                  onChange={(e) =>
                    handleNestedChange(`policy_rules.${index}.rule_id`, e.target.value)
                  }
                />
              </label>
              <label>
                Effect:
                <select
                  value={rule.effect}
                  onChange={(e) =>
                    handleNestedChange(`policy_rules.${index}.effect`, e.target.value)
                  }
                >
                  <option value="enable">Enable</option>
                  <option value="disable">Disable</option>
                </select>
              </label>
              <label>
                Authorized Users:
                <input
                  type="text"
                  value={rule.authorized_users.join(",")}
                  onChange={(e) =>
                    handleNestedChange(
                      `policy_rules.${index}.authorized_users`,
                      e.target.value.split(",")
                    )
                  }
                />
              </label>
              <label>
                Resources:
                <input
                  type="text"
                  value={rule.resource.join(",")}
                  onChange={(e) =>
                    handleNestedChange(
                      `policy_rules.${index}.resource`,
                      e.target.value.split(",")
                    )
                  }
                />
              </label>
    
              <h4>Context Constraints</h4>
              <label>
                User Roles:
                <input
                  type="text"
                  value={rule.context_constraints.user_role.join(",")}
                  onChange={(e) =>
                    handleNestedChange(
                      `policy_rules.${index}.context_constraints.user_role`,
                      e.target.value.split(",")
                    )
                  }
                />
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  value={rule.context_constraints.date_period.start_date}
                  onChange={(e) =>
                    handleNestedChange(
                      `policy_rules.${index}.context_constraints.date_period.start_date`,
                      e.target.value
                    )
                  }
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={rule.context_constraints.date_period.end_date}
                  onChange={(e) =>
                    handleNestedChange(
                      `policy_rules.${index}.context_constraints.date_period.end_date`,
                      e.target.value
                    )
                  }
                />
              </label>
              {/* Similar fields for time_period, weekdays, location_range, place, device, authorized_ip */}
              <h4>Time Period</h4>
<label>
  Start Time:
  <input
    type="time"
    value={rule.context_constraints.time_period.start_time}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.time_period.start_time`,
        e.target.value
      )
    }
  />
</label>
<label>
  End Time:
  <input
    type="time"
    value={rule.context_constraints.time_period.end_time}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.time_period.end_time`,
        e.target.value
      )
    }
  />
</label>

<h4>Weekdays</h4>
<label>
  Weekdays:
  <input
    type="text"
    value={rule.context_constraints.weekdays.join(",")}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.weekdays`,
        e.target.value.split(",")
      )
    }
  />
</label>

<h4>Location Range</h4>
<label>
  Latitude:
  <input
    type="number"
    value={rule.context_constraints.location_range.latitude}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.location_range.latitude`,
        e.target.value
      )
    }
  />
</label>
<label>
  Longitude:
  <input
    type="number"
    value={rule.context_constraints.location_range.longitude}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.location_range.longitude`,
        e.target.value
      )
    }
  />
</label>
<label>
  Radius (meters):
  <input
    type="number"
    value={rule.context_constraints.location_range.radius}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.location_range.radius`,
        e.target.value
      )
    }
  />
</label>

<h4>Places</h4>
<label>
  Places:
  <input
    type="text"
    value={rule.context_constraints.place.join(",")}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.place`,
        e.target.value.split(",")
      )
    }
  />
</label>

<h4>Devices</h4>
{rule.context_constraints.device.map((device, devIndex) => (
  <div key={devIndex}>
    <label>
      Device ID:
      <input
        type="text"
        value={device.id}
        onChange={(e) =>
          handleNestedChange(
            `policy_rules.${index}.context_constraints.device.${devIndex}.id`,
            e.target.value
          )
        }
      />
    </label>
    <label>
      Device Type:
      <input
        type="text"
        value={device.type}
        onChange={(e) =>
          handleNestedChange(
            `policy_rules.${index}.context_constraints.device.${devIndex}.type`,
            e.target.value
          )
        }
      />
    </label>
  </div>
))}
<button
  type="button"
  onClick={() =>
    handleNestedChange(
      `policy_rules.${index}.context_constraints.device`,
      [
        ...rule.context_constraints.device,
        { id: "", type: "" },
      ]
    )
  }
>
  Add Device
</button>

<h4>Authorized IPs</h4>
<label>
  Authorized IPs:
  <input
    type="text"
    value={rule.context_constraints.authorized_ip.join(",")}
    onChange={(e) =>
      handleNestedChange(
        `policy_rules.${index}.context_constraints.authorized_ip`,
        e.target.value.split(",")
      )
    }
  />
</label>

            </div>
          ))}
          <button type="button" onClick={addRule}>
            Add Rule
          </button>
    
          <h3>Proof</h3>
          {policy.proof.map((p, index) => (
            <div key={index}>
              <label>
                Type:
                <input
                  type="text"
                  value={p.type}
                  onChange={(e) => handleNestedChange(`proof.${index}.type`, e.target.value)}
                />
              </label>
              {/* Similar fields for created, creator, verificationMethod, etc. */}
            </div>
          ))}
    
          <button type="submit">Submit Policy</button>
        </form>
      );
};

export default PolicyForm;
