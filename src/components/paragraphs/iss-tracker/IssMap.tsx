"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { IssPosition } from "./types";

interface Props {
  position: IssPosition | null;
  track: [number, number][];
  follow: boolean;
}

function buildTrackSegments(points: [number, number][]): [number, number][][] {
  if (points.length < 2) return [points];
  const segments: [number, number][][] = [];
  let current: [number, number][] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const lngDiff = Math.abs(points[i][1] - points[i - 1][1]);
    if (lngDiff > 180) {
      segments.push(current);
      current = [points[i]];
    } else {
      current.push(points[i]);
    }
  }
  segments.push(current);
  return segments;
}

export default function IssMap({ position, track, follow }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const polylinesRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: false,
      worldCopyJump: true,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 16, attribution: "Esri" },
    ).addTo(map);

    const issIcon = L.divIcon({
      className: "",
      html: '<div style="width:14px;height:14px;background:#a78bfa;border-radius:50%;box-shadow:0 0 0 5px rgba(167,139,250,0.2),0 0 12px rgba(167,139,250,0.4);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([20, 0], { icon: issIcon })
      .bindPopup("", { className: "iss-popup", closeButton: false })
      .addTo(map);

    const circle = L.circle([20, 0], {
      radius: 0,
      color: "#a78bfa",
      fillColor: "#a78bfa",
      fillOpacity: 0.05,
      weight: 1,
      dashArray: "4 4",
    }).addTo(map);

    markerRef.current = marker;
    circleRef.current = circle;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
      polylinesRef.current = [];
    };
  }, []);

  // Update marker, circle, and popup when position changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !circleRef.current || !position) return;
    const latlng: [number, number] = [position.latitude, position.longitude];

    markerRef.current.setLatLng(latlng);
    markerRef.current.setPopupContent(
      `<div style="font-family:monospace;font-size:11px;line-height:1.8;color:#fff;background:#1a1a1a;padding:8px 12px;border:1px solid #333;border-radius:3px;">
        <b style="color:#a78bfa">ISS</b><br/>
        ${Math.abs(position.latitude).toFixed(4)}° ${position.latitude >= 0 ? "N" : "S"}<br/>
        ${Math.abs(position.longitude).toFixed(4)}° ${position.longitude >= 0 ? "E" : "W"}<br/>
        Alt: ${position.altitude} km<br/>
        ${position.velocity.toLocaleString()} km/h
      </div>`,
    );

    circleRef.current.setLatLng(latlng);
    circleRef.current.setRadius((position.footprint / 2) * 1000);

    if (follow) {
      mapRef.current.panTo(latlng, { animate: true, duration: 1 });
    }
  }, [position, follow]);

  // Redraw ground track polylines
  useEffect(() => {
    if (!mapRef.current) return;
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];
    if (track.length < 2) return;

    const segments = buildTrackSegments(track);
    segments.forEach((seg) => {
      if (seg.length < 2) return;
      const line = L.polyline(seg, {
        color: "#a78bfa",
        weight: 1.5,
        opacity: 0.5,
        dashArray: "4 6",
      }).addTo(mapRef.current!);
      polylinesRef.current.push(line);
    });
  }, [track]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 360 }}
    />
  );
}
