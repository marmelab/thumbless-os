import { useRef } from "react";
import { saveProfile } from "../profile";
import { useNavigate } from "react-router";

export const OnboardingPage = () => {
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const name = event.target.name.value;
        const location = event.target.location.value;

        saveProfile({ name, location });
        navigate("/", { replace: true });
    }

    const locationRef = useRef();
    const locationInputRef = useRef();
    const handleLocationAccessChange = async (event) => {
        if (event.currentTarget.checked) {
            const position = await getCurrentPosition()
                .catch(error => {
                    console.error("Error getting position:", error);
                    locationRef.current.textContent = "We couldn't retrieve your position.";
                });

            if (position) {
                const location = await fetchLocationFromPosition(position)
                    .catch(error => {
                        console.error("Error getting position:", error);
                        locationRef.current.textContent = "We couldn't retrieve your position.";
                    });

                if (location) {
                    locationInputRef.current.value = location;
                    locationRef.current.textContent = `Your location is: ${location}`;
                }
            }
        }
    }

    const handleSkip = () => {
        saveProfile({ name: "", location: "" });
        // If the user skips, we can just navigate to the main page
        navigate("/", { replace: true });
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Welcome !</h1>
            <p className="text-lg mb-6">Tell us about yourself:</p>
            <div className="w-full md:1/2 lg:1/3 p-6">
                <form className=" bg-white p-6 rounded shadow-md" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="inline-flex items-center">
                            <input
                                name="allowLocation"
                                type="checkbox"
                                className="h-5 w-5 text-blue-600"
                                onChange={handleLocationAccessChange}
                            />
                            <span className="ml-2 text-sm">Allow location access</span> 
                        </label>
                    </div>
                    <input ref={locationInputRef} type="hidden" name="location" value="" />
                    <p className="mb-4 text-sm" ref={locationRef}></p>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            className="w-full py-2 rounded hover:bg-blue-600 hover:text-white transition duration-200"
                            onClick={handleSkip}
                        >
                            Skip
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

const fetchLocationFromPosition = async (position) => {
    const { latitude, longitude } = position.coords;
    // https://nominatim.openstreetmap.org/reverse?lat=<value>&lon=<value>&<params>
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    if (!response.ok) {
        throw new Error("Failed to fetch location from position.");
    }
    const data = await response.json();
    return data.display_name || "Location not found";
}