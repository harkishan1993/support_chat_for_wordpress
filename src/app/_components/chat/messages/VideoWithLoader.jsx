import { useState } from "react";

const VideoWithLoader = ({ src = "", className = "", ...props }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`${!loaded ? "w-[300px]" : "w-full"} flex justify-center items-center`}>
            {!loaded && (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            )}
            <div className="flex justify-center items-center">
                <video
                    onLoadedData={() => setLoaded(true)}
                    onError={() => setLoaded(true)}
                    className={`${className} ${loaded ? "block" : "hidden"} transition-opacity duration-300`}
                    controls
                    controlsList="nodownload noplaybackrate"
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ width: "100%", borderRadius: "6px" }}
                    src={src}
                    {...props}
                />
            </div>
        </div>
    );
};

export default VideoWithLoader;
