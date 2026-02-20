'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Center {
    id: string;
    name: string;
    address: string;
    type: string;
    latitude: number | null;
    longitude: number | null;
    phone: string;
    workingHours: string | null;
    description: string | null;
    discountRate: number;
}

const MARKER_COLORS: Record<string, string> = {
    wash: '#06b6d4',
    maintenance: '#f59e0b',
    tire: '#10b981',
    both: '#6366f1',
};

const MARKER_EMOJIS: Record<string, string> = {
    wash: '🧽',
    maintenance: '🔧',
    tire: '🛞',
    both: '⭐',
};

const TYPE_LABELS: Record<string, string> = {
    wash: 'Yıkama',
    maintenance: 'Bakım',
    tire: 'Lastik',
    both: 'Yıkama + Bakım + Lastik',
};

function createMarkerIcon(type: string, selected: boolean) {
    const color = MARKER_COLORS[type] || '#6366f1';
    const size = selected ? 42 : 32;
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${selected ? 20 : 16}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      transition: all 150ms ease;
      ${selected ? 'transform:scale(1.2);z-index:1000;' : ''}
    ">${MARKER_EMOJIS[type] || '📍'}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
}

interface MapViewProps {
    centers: Center[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    activeTab: string;
}

export default function MapView({ centers, selectedId, onSelect, activeTab }: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [40.98, 29.08], // Istanbul center
            zoom: 11,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18,
        }).addTo(map);

        mapRef.current = map;
        markersRef.current = L.layerGroup().addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update markers
    useEffect(() => {
        if (!mapRef.current || !markersRef.current) return;

        markersRef.current.clearLayers();

        const validCenters = centers.filter(c => c.latitude && c.longitude);

        validCenters.forEach(c => {
            const color = MARKER_COLORS[c.type] || '#6366f1';
            const marker = L.marker([c.latitude!, c.longitude!], {
                icon: createMarkerIcon(c.type, c.id === selectedId),
            });

            marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:240px;max-width:320px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;">${MARKER_EMOJIS[c.type] || '📍'} ${c.name}</div>
          <div style="font-size:12px;color:#888;margin-bottom:4px;">📍 ${c.address || 'Adres belirtilmemiş'}</div>
          ${c.phone ? `<div style="font-size:12px;color:#888;margin-bottom:4px;">📞 ${c.phone}</div>` : ''}
          ${c.workingHours ? `<div style="font-size:12px;color:#888;margin-bottom:6px;">🕐 ${c.workingHours}</div>` : ''}
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:${c.description ? '8' : '0'}px;">
            <span style="background:${color}20;color:${color};padding:2px 8px;border-radius:100px;font-size:11px;font-weight:600;">
              ${TYPE_LABELS[c.type] || c.type}
            </span>
            <span style="background:#10b98120;color:#10b981;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:600;">
              %${c.discountRate} indirim
            </span>
          </div>
          ${c.description ? `<div style="font-size:12px;color:#999;border-top:1px solid #eee;padding-top:6px;font-style:italic;">💬 ${c.description}</div>` : ''}
        </div>
      `);

            marker.on('click', () => onSelect(c.id));
            marker.addTo(markersRef.current!);
        });

        // Fit bounds
        if (validCenters.length > 0) {
            const bounds = L.latLngBounds(validCenters.map(c => [c.latitude!, c.longitude!]));
            mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
    }, [centers, selectedId, onSelect]);

    // Fly to selected
    useEffect(() => {
        if (!mapRef.current || !selectedId) return;
        const c = centers.find(c => c.id === selectedId);
        if (c?.latitude && c?.longitude) {
            mapRef.current.flyTo([c.latitude, c.longitude], 14, { duration: 0.5 });
        }
    }, [selectedId, centers]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />
    );
}
