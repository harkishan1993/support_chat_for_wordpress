import { memo } from "react";
import { extractTime } from "../../../../utils/extractTime";
import { formatFileSize } from "../../../../utils/formatFileSize";
import ImageWithLoader from "./ImageWithLoader";
import { getYoutubeVideoId } from "../../../../utils/getYoutubeVideoId";
import Linkify from "linkify-react";

const ReplyPreview = ({ reply }) => {
    if (!reply) return null;

    return (
        <div className="border-l-4 border-blue-400 my-1 bg-white dark:bg-slate-600/30 p-2 rounded">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Replying to <strong>{reply.sender?.username}</strong>
            </p>

            {reply.type === "text" && (
                <>
                    {
                        !!getYoutubeVideoId(reply?.body) && <div className="rounded overflow-hidden py-1">
                            <iframe
                                className="w-full aspect-video rounded"
                                src={`https://www.youtube.com/embed/${getYoutubeVideoId(reply?.body)}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    }
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate p-1">
                        <Linkify
                            options={{
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "text-blue-600 hover:underline break-all",
                            }}
                        >
                            {reply?.body}
                        </Linkify>
                    </p>
                </>
            )}

            {reply.type === "file" && (
                reply.files?.map((file, idx) => {
                    const isImage = file.type?.startsWith("image");
                    return <div key={idx} className="flex items-center gap-2 text-sm p-2">
                        {isImage ? (
                            <ImageWithLoader
                                src={file.url}
                                className="w-full h-auto object-cover rounded"
                            />
                        ) : (
                            <div className="relative bg-white  dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 mt-1 shadow-sm">
                                <ImageWithLoader
                                    type="file"
                                    className="w-full h-auto rounded-md shadow"
                                />
                                <div className="mt-2 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                })

            )}

            {reply.type === "emoji" && (
                <p className="text-3xl p-2">{reply.body}</p>
            )}

            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                {extractTime(reply.createdAt)}
            </p>
        </div>
    );
};

export default memo(ReplyPreview)