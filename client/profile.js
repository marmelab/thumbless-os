export const saveProfile = ({ name, location }) => {
    window.localStorage.setItem("profile", JSON.stringify({ name, location }));
}

export const getProfile = () => {
    const profile = window.localStorage.getItem("profile");
    return profile ? JSON.parse(profile) : null;
}
