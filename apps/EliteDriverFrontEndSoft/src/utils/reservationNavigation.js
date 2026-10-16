// Shared by the home fleet and catalog so visitors take the same login path.
export function goToReservation(navigate, vehicleId, user) {
    const redirectTo = `/customer/reservation-page/${encodeURIComponent(vehicleId)}`;
    if (user?.isAuthenticated) {
        navigate(redirectTo);
    } else {
        navigate('/login', { state: { redirectTo } });
    }
}
