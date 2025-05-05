import React, { useState } from 'react';
import AddTripModal from './AddTripModal';

const TripTimeline = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleAddTripClick = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <div>
            {/* ...existing code... */}
            <button onClick={handleAddTripClick}>Add Trip</button>
            <AddTripModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default TripTimeline;