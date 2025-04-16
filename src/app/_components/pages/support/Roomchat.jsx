"use client";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Accordion, AccordionSummary, AccordionDetails, Card, CardContent, Typography, Divider } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
export default function SupportPage() {
  const welcomeMessages = [
    "Hi there! 👋",
    "Welcome to our site!",
    "Ask us anything. We're here to help!",
  ];
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expanded, setExpanded] = useState(null);
  // Start animation after the iframe has fully loaded
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500); // Small delay to ensure iframe is rendered
  }, []);
  useEffect(() => {
    if (isLoaded) {
      welcomeMessages.forEach((msg, index) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, msg]);
        }, index * 1000); // Delay each message
      });
    }
  }, [isLoaded]);

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleSelect = (option) => {

  };

  return (
    <>
      <div className="flex-grow flex justify-center items-center overflow-auto">
        <Card className="max-w-md mx-auto p-6 shadow-lg rounded-lg bg-white w-full">
          <div className="sticky top-0 bg-white z-10 p-2">
            <Typography variant="h5" className="font-bold text-center mb-4">
              Support Chat
            </Typography>
            <Divider sx={{ my: 2 }} />
          </div>
          {/* Animated Welcome Messages */}
          <div className="text-center text-gray-600 mb-4">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: index * 0.005 }}
              >
                <Typography variant="body1">{msg}</Typography>
              </motion.div>
            ))}
          </div>

          <CardContent>
            <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>I have questions about my order</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Button variant="contained" fullWidth onClick={() => handleSelect("I have questions about my order")}>
                  Chat Now
                </Button>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>I want agent support for my order</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Button variant="contained" fullWidth onClick={() => handleSelect("I want agent support for my order")}>
                  Chat Now
                </Button>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel3"} onChange={handleChange("panel3")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>I want to know my order status</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Button variant="contained" fullWidth onClick={() => handleSelect("I want to know my order status")}>
                  Chat Now
                </Button>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
    </>
  );
}