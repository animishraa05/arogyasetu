import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  PawPrint, // Mithun
  Box, // Xorai
  Ghost, // Kanglasha (placeholder for mythical creature)
  Cloud, // Meghalaya Emblem (mountains and clouds)
  Palette, // Puan (fabric)
  Bird, // Hornbill
  Leaf, // Red Panda (placeholder for nature/animal)
  LandPlot, // Temple (placeholder for structure)
  ExternalLink,
  Mountain, // Arunachal Pradesh
  Coffee, // Assam
  Swords, // Manipur
  CloudRain, // Meghalaya
  Bamboo, // Mizoram
  Feather, // Nagaland
  Snowflake, // Sikkim
  Building, // Tripura
  SquareStack // Mizoram (Puan)
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StateData {
  nameKey: string;
  statisticKey: string;
  icon: React.ReactNode;
  healthPortalUrl: string;
  backgroundClass: string;
}

const StateCards: React.FC = () => {
  const { t } = useTranslation();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const statesData: StateData[] = [
    {
      nameKey: "arunachal_pradesh",
      statisticKey: "arunachal_pradesh_fact",
      icon: <Mountain className="w-8 h-8 text-blue-600" />,
      healthPortalUrl: "https://arunachalhealth.com/",
      backgroundClass: "bg-gradient-to-br from-blue-100 to-blue-200",
    },
    {
      nameKey: "assam",
      statisticKey: "assam_fact",
      icon: <Coffee className="w-8 h-8 text-green-600" />,
      healthPortalUrl: "https://health.assam.gov.in/",
      backgroundClass: "bg-gradient-to-br from-green-100 to-green-200",
    },
    {
      nameKey: "manipur",
      statisticKey: "manipur_fact",
      icon: <Swords className="w-8 h-8 text-purple-600" />,
      healthPortalUrl: "https://mn.gov.in/",
      backgroundClass: "bg-gradient-to-br from-purple-100 to-purple-200",
    },
    {
      nameKey: "meghalaya",
      statisticKey: "meghalaya_fact",
      icon: <CloudRain className="w-8 h-8 text-gray-600" />,
      healthPortalUrl: "https://meghealth.gov.in/",
      backgroundClass: "bg-gradient-to-br from-gray-100 to-gray-200",
    },
    {
      nameKey: "mizoram",
      statisticKey: "mizoram_fact",
      icon: <SquareStack className="w-8 h-8 text-pink-600" />,
      healthPortalUrl: "https://health.mizoram.gov.in/",
      backgroundClass: "bg-gradient-to-br from-pink-100 to-pink-200",
    },
    {
      nameKey: "nagaland",
      statisticKey: "nagaland_fact",
      icon: <Feather className="w-8 h-8 text-yellow-600" />,
      healthPortalUrl: "https://health.nagaland.gov.in/",
      backgroundClass: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    },
    {
      nameKey: "sikkim",
      statisticKey: "sikkim_fact",
      icon: <Snowflake className="w-8 h-8 text-red-600" />,
      healthPortalUrl: "http://health.sikkim.gov.in/",
      backgroundClass: "bg-gradient-to-br from-red-100 to-red-200",
    },
    {
      nameKey: "tripura",
      statisticKey: "tripura_fact",
      icon: <Building className="w-8 h-8 text-orange-600" />,
      healthPortalUrl: "https://health.tripura.gov.in/",
      backgroundClass: "bg-gradient-to-br from-orange-100 to-orange-200",
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
        {statesData.map((state) => (
          <Tooltip key={state.nameKey}>
            <TooltipTrigger asChild>
              <motion.div
                className={`relative flex flex-col items-center justify-center p-4 rounded-lg shadow-md cursor-pointer overflow-hidden ${state.backgroundClass}`}
                onHoverStart={() => setHoveredState(state.nameKey)}
                onHoverEnd={() => setHoveredState(null)}
                whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative z-10 flex flex-col items-center">
                  {state.icon}
                  <h3 className="mt-2 text-lg font-semibold text-gray-800 text-center">{t(state.nameKey)}</h3>
                </div>
                {hoveredState === state.nameKey && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-blue-500/90 text-white flex flex-col items-center justify-center p-4 rounded-lg text-center z-20"
                  >
                    <p className="text-sm font-medium">{t(state.statisticKey)}</p>
                    <a 
                      href={state.healthPortalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-2 text-xs underline flex items-center"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering parent hover
                    >
                      Visit Portal <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t(state.statisticKey)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default StateCards;