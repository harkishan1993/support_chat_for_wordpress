import { useState } from "react";
const ImageWithLoader = ({ src="/frame.png", alt = "/frame.png", className = "", type="image" }) => {
	const [loaded, setLoaded] = useState(false);
	return (
		<div className={`${!loaded ? "w-[300px]" : "w-full"}`}>
			{!loaded && (
				<div className={`w-full h-[400px] flex items-center justify-center bg-gray-100`}>
					<div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
				</div>
			)}
			<img
				src={src}
				alt={alt}
				onLoad={() => setLoaded(true)}
				onError={() => setLoaded(true)}
				className={`${className} transition-opacity duration-300 ${loaded ? "block" : "hidden"}`}
			/>
		</div>
	);
};

export default ImageWithLoader;
