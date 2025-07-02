export const saveProfile = (profile) => {
    window.localStorage.setItem("profile", JSON.stringify(profile));
}

export const getProfile = () => {
    const profile = window.localStorage.getItem("profile");
    return profile ? JSON.parse(profile) : null;
}
