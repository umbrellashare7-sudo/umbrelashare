import React from 'react';
import { Umbrella, LocationType } from '../types';
import { MapPin, AlertCircle, CheckCircle, Droplets } from 'lucide-react';

interface UmbrellaCardProps {
  umbrella: Umbrella;
  userLocation: LocationType;
  onBorrow: (id: string) => void;
  canBorrow: boolean;
}

const UmbrellaCard: React.FC<UmbrellaCardProps> = ({ umbrella, userLocation, onBorrow, canBorrow }) => {
  const isAvailable = umbrella.status === 'available';
  const isHere = umbrella.location === userLocation;
  
  // Only show available umbrellas clearly, others dimmed
  const opacityClass = isAvailable ? 'opacity-100' : 'opacity-60 grayscale';

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-md ${opacityClass}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
             <div className={`p-2 rounded-full ${isAvailable ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <Droplets size={20} />
             </div>
             <div>
                <h3 className="font-semibold text-slate-800">{umbrella.id}</h3>
                <p className="text-xs text-slate-500">{umbrella.condition}</p>
             </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isAvailable ? 'bg-green-100 text-green-700' : 
            umbrella.status === 'rented' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
          }`}>
            {umbrella.status.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center text-slate-500 text-sm mt-3">
          <MapPin size={16} className="mr-1" />
          <span>{umbrella.location}</span>
        </div>
      </div>

      <div className="mt-4">
        {isAvailable && (
            <button
              onClick={() => onBorrow(umbrella.id)}
              disabled={!canBorrow || !isHere}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center
                ${!canBorrow 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : !isHere
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }
              `}
            >
              {!canBorrow ? 'Limit Reached' : !isHere ? 'Wrong Location' : 'Borrow Now'}
            </button>
        )}
        {!isAvailable && (
            <div className="w-full py-2 text-center text-xs text-slate-400 italic">
                Unavailable
            </div>
        )}
      </div>
    </div>
  );
};

export default UmbrellaCard;
