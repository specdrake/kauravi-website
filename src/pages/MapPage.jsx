import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons with Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
    // Center roughly on Meerut
    const position = [28.9845, 77.7064];

    // Key districts to highlight
    const districts = [
        { name: "Meerut", coords: [28.9845, 77.7064], desc: "The epicenter of the 1857 rebellion and a major cultural hub of Harit Pradesh." },
        { name: "Muzaffarnagar", coords: [29.4727, 77.7085], desc: "Known as the sugar bowl of India, deeply rooted in agrarian traditions." },
        { name: "Saharanpur", coords: [29.9640, 77.5460], desc: "Famous for wood carving and agricultural produce." },
        { name: "Baghpat", coords: [28.9424, 77.2272], desc: "Historically significant, tracing roots to the Mahabharata." },
        { name: "Shamli", coords: [29.4476, 77.3113], desc: "A prominent agricultural and industrial district in the sugarcane belt." },
        { name: "Bulandshahr", coords: [28.4069, 77.8498], desc: "Rich in history and agriculture." },
        { name: "Ghaziabad", coords: [28.6692, 77.4538], desc: "Industrial and educational gateway to Western UP." },
        { name: "Hapur", coords: [28.7306, 77.7759], desc: "Known for its massive grain and jaggery markets." }
    ];

    return (
        <div className="container map-page-body" style={{ marginTop: '2.5rem', marginBottom: '4rem' }}>
            <div className="article-header">
                <h2>Map of Western Uttar Pradesh</h2>
                <p className="article-meta">The proposed Harit Pradesh / Paschim Pradesh region.</p>
            </div>

            <p>
                Western Uttar Pradesh encompasses several distinct districts that share the Kauravi dialect (Khari Boli)
                and a deeply embedded agrarian lifestyle. This proposed state of Harit Pradesh highlights a shared
                cultural heritage distinct from the eastern Awadhi/Bhojpuri speaking regions of the state.
            </p>

            <div className="map-container">
                <MapContainer center={position} zoom={8} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {districts.map((d, index) => (
                        <Marker key={index} position={d.coords}>
                            <Popup>
                                <strong>{d.name}</strong><br />
                                {d.desc}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
