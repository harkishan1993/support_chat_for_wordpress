"use client";
import React, { useRef } from "react";
import Draggable from "react-draggable";

const DraggableDialog = ({ children }) => {
    const nodeRef = useRef(null); // NEW: nodeRef instead of findDOMNode

    return (
        <Draggable nodeRef={nodeRef}>
            <div ref={nodeRef} style={{ position: "absolute", top: "50%", zIndex: 1300 }}>
                {children}
            </div>
        </Draggable>
    );
};

export default DraggableDialog;
