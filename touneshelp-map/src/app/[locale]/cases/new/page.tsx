"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ComponentType,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "@/components/language-switcher";
import { useMapEvents } from "react-leaflet";

// Custom type definitions for dynamic import components
// These extend the base react-leaflet types with the props we need
interface MapContainerComponentProps {
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface TileLayerComponentProps {
  attribution?: string;
  url: string;
}

interface MarkerComponentProps {
  position: [number, number];
  children?: React.ReactNode;
}

interface PopupComponentProps {
  children?: React.ReactNode;
}

// Dynamically import Map components with SSR disabled and proper typing
const MapContainer = dynamic(() =>
  import("react-leaflet").then((mod) => mod.MapContainer)
) as ComponentType<MapContainerComponentProps>;
const TileLayer = dynamic(() =>
  import("react-leaflet").then((mod) => mod.TileLayer)
) as ComponentType<TileLayerComponentProps>;
const Marker = dynamic(() =>
  import("react-leaflet").then((mod) => mod.Marker)
) as ComponentType<MarkerComponentProps>;
const Popup = dynamic(() =>
  import("react-leaflet").then((mod) => mod.Popup)
) as ComponentType<PopupComponentProps>;

type UploadedImage = {
  name: string;
  src: string;
};

function LocationPicker({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (event: { latlng: { lat: number; lng: number } }) => {
      onLocationChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function CaseCreatePage() {
  const pathname = usePathname();
  const locale = useMemo(() => {
    if (!pathname) return "fr";
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] || "fr";
  }, [pathname]);

  const pagePrefix = `/${locale}`;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(34.0);
  const [longitude, setLongitude] = useState(9.0);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [assistantPhone, setAssistantPhone] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const uploaded: UploadedImage[] = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === "string") return resolve(reader.result);
          reject(new Error("Could not read image file"));
        };
        reader.onerror = () => {
          reject(new Error("Image read failed"));
        };
        reader.readAsDataURL(file);
      });
      uploaded.push({ name: file.name, src: dataUrl });
    }
    setImages((prev) => [...prev, ...uploaded]);
  };
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported in your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage("Location captured successfully.");
      },
      (error) => {
        setMessage(`Could not get location: ${error.message}`);
      }
    );
  };

  useEffect(() => {
    if (!latitude || !longitude) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: { "User-Agent": "TounesHelpMap/1.0" },
            signal: controller.signal,
          }
        );

        if (!response.ok) return;
        const data = await response.json();
        const cityName =
          (data.address?.city as string) ||
          (data.address?.town as string) ||
          (data.address?.village as string) ||
          "";
        const stateName =
          (data.address?.state as string) ||
          (data.address?.county as string) ||
          "";
        if (cityName) setCity(cityName);
        if (stateName) setGovernorate(stateName);
      } catch (err) {
        // ignore abort or network issues
      }
    }, 500);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [latitude, longitude]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!title || !description || !governorate) {
      setMessage("Title, description, and governorate are required.");
      setSubmitting(false);
      return;
    }

    if (!contactName || !contactPhone) {
      setMessage("At least one contact name and phone number are required.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      description,
      governorate,
      city,
      latitude: Number(latitude),
      longitude: Number(longitude),
      contacts: [
        {
          fullName: contactName,
          phone: contactPhone,
          email: contactEmail || null,
          address: contactAddress || null,
        },
      ],
      assistants: assistantName
        ? [{ name: assistantName, contact: assistantPhone || "" }]
        : [],
      images: images.map((img) => img.src),
    };
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Submit failed (${response.status}): ${text}`);
      }

      setMessage("Case submitted successfully! Redirecting...");
      setTimeout(() => {
        router.push(`${pagePrefix}/cases`);
      }, 800);
    } catch (error) {
      setMessage(`Error submitting case: ${String(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-cyan-50 p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Report a New Case
          </h1>
          <p className="mt-1 text-slate-600">
            {" "}
            Help us locate affected communities by submitting accurate case
            details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="buttons" />
          <Link
            href={`${pagePrefix}/cases`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to Cases
          </Link>
        </div>
      </div>
      {message && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block font-semibold text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">
              Governorate
            </label>
            <input
              type="text"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="mt-2 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="mt-2 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
          >
            {" "}
            Use My Location
          </button>
        </div>
        <div>
          <label className="block font-semibold text-slate-700">Map</label>
          <div className="mt-2 h-64 w-full overflow-hidden rounded-lg border">
            <MapContainer
              center={[latitude, longitude]}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]}>
                <Popup>Case Location</Popup>
              </Marker>
              <LocationPicker
                onLocationChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
            </MapContainer>
          </div>
        </div>
        <div>
          <label className="block font-semibold text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            required
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-700">
              Contact Person (Person in Need)
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Full Name *
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Phone *
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Address
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
            </div>
          </div>
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-700">
              Assistant (Who Can Help)
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Name
              </label>
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Contact
              </label>
              <input
                type="tel"
                value={assistantPhone}
                onChange={(e) => setAssistantPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="mt-2 w-full rounded-lg border p-2"
          />
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.src}
                    alt={img.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-cyan-600 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Case"}
        </button>
      </form>
    </div>
  );
}
