<script lang="ts">
	import Card from '@smui/card';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import { GET, POST } from '../../routes/apiService';
	import Location from '../../assets/icons/location.png';
	import './locationForm.scss';
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import Button, { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import { langChange, profile } from '../../store';
	import Dialog from '@smui/dialog';
	import Alerts from '../alerts.svelte';
	import { _ } from 'svelte-i18n';

	export let locationFormObj: any;

	let open: boolean = false;
	let country: any[] = [];
	let selectedCountryCities: any[] = [];
	let BcID: any;
	let name = '';
	let description = '';
	let countryId: number;
	let cityId: any;
	let address = '';
	let googleMapLink = '';
	let status = true;
	let disabled_fields: any;
	let google_map: any;
	let map: google.maps.Map;
	let markers: google.maps.Marker[] = [];
	let marker: any;
	let center = { lat: 22.7554, lng: 46.2092 };
	let markerPositions: google.maps.LatLngLiteral[] = [];
	let alertData: any;
	let openAlerts: boolean = false;
	let reCallAlerts: any;
	let lang: string = 'en';
	let noLabel: boolean = false;
	let cancel: any = 'Cancel';
	let btnText = locationFormObj.view == 'create' ? 'Save Information' : 'Update Information';

	onMount(() => {
		lang = localStorage.getItem('language')!;
		if (locationFormObj.view == 'edit' || locationFormObj.view == 'view') {
			getLocationById();
		}
		getCountry();
		onCountryClick();
	});

	afterUpdate(() => {
		lang = localStorage.getItem('language')!;
		if (cityId != undefined) {
			noLabel = true;
		}
	});

	let getCountry = () => {
		let url = `Country/GetAll?SortColumn=name&PageNumber=1&PageSize=100&SortOrder=a`;
		GET(url).then((result) => {
			if (result.succeeded) {
				country = result.data;
				country.forEach((element) => {
					countryId = element.id;
				});
			}
		});
	};

	let getLocationById = () => {
		let url = `Location/GetById?Id=${locationFormObj.id}`;
		GET(url).then((result) => {
			if (result.succeeded) {
				name = result.data.name;
				description = result.data.description;
				countryId = result.data.countryId;
				cityId = result.data.cityId;
				address = result.data.address;
				googleMapLink = result.data.googleMapLink;
			}
		});
	};

	let onCountryClick = () => {
		let url = `City/GetCityByCountryId?countryId=${1}`;
		GET(url).then((result) => {
			if (result.succeeded) {
				selectedCountryCities = result.data;
			}
		});
	};

	let mapLocation = () => {
		map = new google.maps.Map(google_map, {
			zoom: 6,
			center
		});
		map.addListener('click', (event: google.maps.MapMouseEvent) => {
			markerPositions.push(event.latLng!.toJSON());
			markerPositions.forEach((element) => {
				(center.lat = element.lat), (center.lng = element.lng);
			});
			addMarker(event.latLng!);
		});
	};

	let addMarker = (position: google.maps.LatLng | google.maps.LatLng) => {
		deleteMarkers();
		markerPositions = [];
		marker = new google.maps.Marker({
			position,
			map
		});
		setTimeout(() => {
			open = false;
		}, 1000);
		googleMapLink = `https://maps.google.com/maps?q=${center.lat},${center.lng}`;
		console.log('Google Map Link*', googleMapLink);
	};

	let setMapOnAll = (map: google.maps.Map | null) => {
		for (let i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	};

	let deleteMarkers = () => {
		google.maps.Map == null;
		setMapOnAll(null);
		markers = [];
	};

	let onSubmit = () => {
		profile.subscribe(async (val: any) => {
			BcID = val.bcId;
		});
		let url = `Location/AddUpdate`;
		let data = {
			id: locationFormObj.view == 'edit' ? locationFormObj.id : 0,
			bcId: BcID,
			name,
			description,
			countryId,
			cityId,
			address,
			googleMapLink,
			status
		};
		if (name != '' && description != '' && cityId != 0 && address != '' && googleMapLink != '') {
			POST(url, data).then((result) => {
				if (result.succeeded) {
					goto('/main/BCprofile');
					openAlerts = true;
					alertData = {
						heading: 'Success',
						message: result.message,
						type: 'success'
					};
					reCallAlerts();
				} else {
					openAlerts = true;
					alertData = {
						heading: 'Error',
						message: result.message,
						type: 'error'
					};
					reCallAlerts();
				}
			});
		} else {
			openAlerts = true;
			alertData = {
				heading: 'Warning',
				message: 'Please fill all required fields.',
				type: 'error'
			};
			reCallAlerts();
		}
	};

	if (locationFormObj.view == 'view') {
		disabled_fields = true;
	}
</script>

<main class="main">
	<Card class="location_form">
		<hp class="ff-poppins-semibold">{$_('Address Details')}</hp>
		<div class="form_block">
			<div style="width: 48%" class="input-field">
				<p class="ff-poppins" style="font-size:13px; color: #606060;">{$_('Address Name')}*</p>
				<Textfield
					disabled={disabled_fields}
					style="width: 100%"
					class="shaped-outlined"
					variant="outlined"
					bind:value={name}
					label="{$_('Address Name')}*"
					noLabel={true}
					ripple={false}
				/>
			</div>

			<div style="width: 48%" class="input-field">
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Description')}*</p>
				<Textfield
					disabled={disabled_fields}
					class="shaped-outlined"
					style="width: 100%"
					variant="outlined"
					bind:value={description}
					label="{$_('Description')}*"
					noLabel={true}
					ripple={false}
				/>
			</div>
			<div style="width: 31%" class="input-field">
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Country')}*</p>
				<Select
					disabled={disabled_fields}
					variant="outlined"
					value={countryId}
					label="{$_('Country')}*"
					class="shaped-filled"
					noLabel={true}
				>
					{#each country as data}
						<Option value={data.id}>{lang == 'en' ? data.name : data.arName}</Option>
					{/each}
				</Select>
			</div>

			<div style="width: 31%" class="input-field">
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('City')}*</p>
				<Select
					disabled={disabled_fields}
					variant="outlined"
					value={cityId}
					label="{$_('City')}*"
					class="shaped-filled"
					ripple={false}
					{noLabel}
				>
					{#each selectedCountryCities as type}
						<Option value={type.id} on:click={() => (cityId = type.id)}
							>{lang == 'en' ? type.name : type.arName}</Option
						>
					{/each}
				</Select>
			</div>

			<div style="width: 31.5%" class="input-field">
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Address')}*</p>
				<Textfield
					disabled={disabled_fields}
					class="shaped-outlined"
					variant="outlined"
					bind:value={address}
					label="{$_('Add Address')}*"
					noLabel={true}
					ripple={false}
				/>
			</div>

			<div style="width: 64.3%" class="input-field">
				<p class="ff-poppins" style="font-size:13px; color: #606060">{$_('Google Map Link')}*</p>
				<Textfield
					disabled={disabled_fields}
					class="shaped-outlined"
					style="width: 100%"
					variant="outlined"
					bind:value={googleMapLink}
					label="{$_('Google Map Link')}*"
					noLabel={true}
					ripple={false}
				/>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="location_map ff-poppins"
				on:click={() => (open = true)}
				on:click={mapLocation}
				style={disabled_fields ? 'pointer-events: none' : ''}
			>
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src={Location} width="20px" height="20px" />
				<p>{$_('Select Location From Map')}*</p>
			</div>
		</div>
	</Card>

	<div class="button-block">
		{#if locationFormObj.view == 'create' || locationFormObj.view == 'edit'}
			<Button on:click={onSubmit} class="btn ff-poppins-semibold" variant="raised">
				<Label>{$_(btnText)}</Label>
			</Button>
		{/if}
		<Button
			on:click={() => goto('/main/BCprofile')}
			class="btn ff-poppins-semibold"
			variant="raised"
			style=" background: rgb(149, 152, 154); width:165px"
		>
			<Label>{$_(cancel)}</Label>
		</Button>
	</div>
</main>

<Dialog bind:open surface$style="width: 810px; max-width: calc(100vw - 32px);">
	<Card class="map">
		<div class="full-screen" bind:this={google_map} />
	</Card>
</Dialog>

<Alerts {alertData} {openAlerts} bind:reCallAlerts />
