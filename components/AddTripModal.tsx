import React, { useEffect } from 'react';

const AddTripModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        } else {
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
        return () => {
            document.body.style.overflow = 'auto'; // Cleanup on unmount
        };
    }, [isOpen]);

    if (!isOpen) return null; // Ensure modal is not rendered when closed

    return (
        <div
            className="modal-overlay"
            onClick={onClose} // Close modal when clicking on the overlay
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '500px',
                    width: '100%',
                }}
            >
                {/* ...existing modal content... */}
                <button onClick={onClose} style={{ marginTop: '10px' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default AddTripModal;