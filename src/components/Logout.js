import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();
    const hasConfirmed = useRef(false);

    useEffect(() => {
        if (!hasConfirmed.current) {
            const confirmLogout = window.confirm('Apakah Anda yakin ingin logout?');
            hasConfirmed.current = true;

            if (confirmLogout) {
                localStorage.clear();
                alert('Anda telah logout.');
                navigate('/');
            } else {
                navigate('/budget');
            }
        }
    }, [navigate]);

    return null;
}

export default Logout;
