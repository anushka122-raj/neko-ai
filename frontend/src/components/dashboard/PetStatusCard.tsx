import "./Dashboard.css";

type PetStatusCardProps = {
  mood?: string;
  energy?: number;
  friendship?: number;
};

function PetStatusCard({
  mood = "Happy 😊",
  energy = 72,
  friendship = 84,
}: PetStatusCardProps) {
  return (
    <div className="widget pet-status-card">
      <h2>🐱 Neko Status</h2>

      <div className="pet-status-row">
        <span>Mood</span>
        <strong>{mood}</strong>
      </div>

      <div className="pet-status-row">
        <span>Energy</span>
        <strong>{energy}%</strong>
      </div>

      <div className="pet-status-row">
        <span>Friendship</span>
        <strong>{friendship}%</strong>
      </div>
    </div>
  );
}

export default PetStatusCard;