<script lang="ts">
	import { page } from '$app/stores';
	import Drawer, { AppContent, Content, Header } from '@smui/drawer';
	import Toolbar from '../../components/toolbar/toolbar.svelte';
	import List, { Item } from '@smui/list';
	import { goto } from '$app/navigation';
	import Select, { Option } from '@smui/select';
	import './main.scss';
	import '../../global.scss';
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import AskingAlert from '../../components/asking-alert.svelte';
	import { _, init, register } from 'svelte-i18n';
	import { langChange, profile, loader } from '../../store';
	import { GET } from '../apiService';
	import B2BLogo from '../../assets/images/blue-logo.png';
	import dashboard from '../../assets/icons/dashboard.png';
	import dashboardBlack from '../../assets/icons/dashboard-black.png';
	import rfq from '../../assets/icons/rfqs.png';
	import rfqBlack from '../../assets/icons/rfqs-black.png';
	import order from '../../assets/icons/orders.png';
	import orderBlack from '../../assets/icons/orders-black.png';
	import products from '../../assets/icons/products.png';
	import productsBlack from '../../assets/icons/products-black.png';
	import BCProfile from '../../assets/icons/business-customers.png';
	import BCProfileBlack from '../../assets/icons/business-customers-black.png';
	import Users from '../../assets/icons/admins.png';
	import UsersBlack from '../../assets/icons/admins-black.png';
	import logoutIcon from '../../assets/icons/logout.png';
	import logoutBlack from '../../assets/icons/logout-black.png';
	import iconLang from '../../assets/icons/language.png';
	import Loader from '../../components/loader.svelte';

	let ref = $page.url.pathname;
	let active = ref;
	let titleHeading = '';
	let open: boolean = false;
	let askingAlertData: any;
	let reCallAlert: any;
	let lang: string;
	const selectLanguage = ['English', 'Arabic'];
	let currentLang = 'English';
	init({
		fallbackLocale: 'en',
		initialLocale: 'en'
	});

	const tokenExpired = (token: string) => {
		const expiry = JSON.parse(atob(token.split('.')[1])).exp;
		return Math.floor(new Date().getTime() / 1000) >= expiry;
	};

	onMount(() => {
		getProfile();
		let token: any = localStorage.getItem('token');
		lang = localStorage.getItem('language')!;
		if (lang && lang != null) {
			if (lang == 'ar') {
				currentLang = 'Arabic';
				changeLanguage('Arabic');
			} else {
				currentLang = 'English';
				changeLanguage('English');
			}
		}
		if (token == null) {
			goto('/auth/login');
		} else {
			if (tokenExpired(token)) {
				goto('/auth/login');
			}
		}
		localStorage.setItem('title', 'Dashboard');
	});

	let getProfile = () => {
		let url = 'Account/GetMyProfile';
		GET(url).then((response) => {
			if (response.succeeded) {
				profile.set(response.data);
			}
		});
	};

	function setActive(value: string, title: string) {
		active = value;
		titleHeading = title;
		localStorage.setItem('title', title);
	}

	let logout = () => {
		open = true;
		askingAlertData = {
			heading: 'Log out!',
			message: 'You will be retured to the sign in screen',
			leftButtonText: 'Logout',
			rightButtonText: 'Cancel'
		};
		reCallAlert();
	};

	let onAlertActions = (ev: any) => {
		if (ev.detail.status) {
			localStorage.removeItem('token');
			localStorage.removeItem('title');
			goto('/auth/login');
		}
	};

	let changeLanguage = (ev: string) => {
		if (ev == 'English') {
			langChange.update((x) => (x = true));
			localStorage.setItem('language', 'en');
			register('en', () => import('../../lang/en.json'));
			init({
				fallbackLocale: 'en',
				initialLocale: 'en'
			});
			document.documentElement.dir = 'ltr';
		} else if (ev == 'Arabic') {
			langChange.update((x) => (x = true));
			localStorage.setItem('language', 'ar');
			register('ar', () => import('../../lang/ar.json'));
			init({
				fallbackLocale: 'ar',
				initialLocale: 'ar'
			});
			document.documentElement.dir = 'rtl';
		}
	};
</script>

<div class="drawer-container">
	<Drawer>
		<div class="sideMenu_alignment">
			<Content>
				<Header>
					<img class="b2b_sideMenu" src={B2BLogo} alt="" />
				</Header>
				<List class="list">
					<Item
						href="/main/dashboard"
						on:click={() => setActive('/main/dashboard', 'Dashboard')}
						activated={active === '/main/dashboard'}
					>
						<img src={dashboard} class="icon-image" alt="" />
						<img src={dashboardBlack} class="hover-image" alt="" />
						<p>{$_('Dashboard')}</p>
					</Item>
				</List>

				<List class="list">
					<Item
						href="/main/rfqs"
						on:click={() => setActive('/main/rfqs', 'Request for Quotations')}
						activated={active === '/main/rfqs'}
					>
						<img src={rfq} class="icon-image" alt="" />
						<img src={rfqBlack} class="hover-image" alt="" />
						<p>{$_('Request for Quotations')}</p>
					</Item>
				</List>

				<List class="list">
					<Item
						href="/main/orders"
						on:click={() => setActive('/main/orders', 'Orders')}
						activated={active === '/main/orders'}
					>
						<img src={order} class="icon-image" alt="" />
						<img src={orderBlack} class="hover-image" alt="" />
						<p>{$_('Orders')}</p>
					</Item>
				</List>

				<List class="list">
					<Item
						href="/main/products"
						on:click={() => setActive('/main/products', 'Products')}
						activated={active === '/main/products'}
					>
						<img src={products} class="icon-image" alt="" />
						<img src={productsBlack} class="hover-image" alt="" />
						<p>{$_('Products')}</p>
					</Item>
				</List>

				<div class="hr" />

				<List class="list">
					<Item
						href="/main/BCprofile"
						on:click={() => setActive('/main/BCprofile', 'Company Profile')}
						activated={active === '/main/BCprofile'}
					>
						<img src={BCProfile} class="icon-image" alt="" />
						<img src={BCProfileBlack} class="hover-image" alt="" />
						<p>{$_('Company Profile')}</p>
					</Item>
				</List>

				<List class="list">
					<Item
						href="/main/customers"
						on:click={() => setActive('/main/customers', 'Manage Users')}
						activated={active === '/main/customers'}
					>
						<img src={Users} class="icon-image" alt="" />
						<img src={UsersBlack} class="hover-image" alt="" />

						<p>{$_('Manage Users')}</p>
					</Item>
				</List>

				<List class="list">
					<Item class="logout" on:click={logout} activated={active === '/main/logout'}>
						<img src={logoutIcon} class="icon-image" alt="" />
						<img src={logoutBlack} class="hover-image" alt="" />

						<p>{$_('Logout')}</p>
					</Item>
				</List>

				<List class="list">
					<Select
						variant="filled"
						bind:value={currentLang}
						on:click={() => changeLanguage(currentLang)}
						class="ff-poppins select-lang"
					>
						<img src={iconLang} alt="language icon" class="icon-lang" slot="leadingIcon" />
						{#each selectLanguage as lang}
							<Option value={lang}>
								<img src={iconLang} alt="language icon" class="icon-lang" />
								{lang}
							</Option>
						{/each}
					</Select>
				</List>
			</Content>
		</div>
	</Drawer>

	<AppContent class="app-content">
		<main class="main-content">
			<Toolbar title={titleHeading} />
			<slot />
		</main>
	</AppContent>
</div>

<AskingAlert {open} {askingAlertData} bind:reCallAlert on:onClickAertAction={onAlertActions} />
{#if $loader}
	<Loader />
{/if}
