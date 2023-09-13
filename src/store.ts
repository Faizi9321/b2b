import { writable } from "svelte/store";


export let profile = writable('')
export let langChange = writable(false)
export let detectNotification = writable(false)
export let loader = writable(false)