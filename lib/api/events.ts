import axios from "axios";
import type { Event, EventsQuery } from "@/types/event";
import apiClient from "../axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getPublishEvents(query?: EventsQuery): Promise<Event[]> {
    return apiClient.get("/events/publish", { params: query });
}

export async function getEventById(id: string): Promise<Event> {
    return apiClient.get(`/events/${id}/publish`);
}

