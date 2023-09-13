<script lang="ts">
	import '../auth/auth.scss';
	import '../../global.scss';
	import Select, { Option } from '@smui/select';
	import { _, init, register } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import B2BLogo from '../../assets/images/white-logo.png';
	import illustration from '../../assets/images/illustration.png';
	import iconLang from '../../assets/icons/language.png';
	import Loader from '../../components/loader.svelte';
	import { loader } from '../../store';

	const selectLanguage = ['English', 'Arabic'];
	let currentLang: string;
	let lang: string;
	init({
		initialLocale: 'en',
		fallbackLocale: ''
	});

	onMount(() => {
		lang = localStorage.getItem('language')!;
		if (lang && lang != null) {
			if (lang == 'ar') {
				currentLang = 'Arabic';
				changeLanguage('Arabic');
			} else {
				currentLang = 'English';
				changeLanguage('English');
			}
		} else {
			currentLang = 'English';
			localStorage.setItem('language', 'en');
		}
	});

	let changeLanguage = (ev: string) => {
		if (ev == 'English') {
			localStorage.setItem('language', 'en');
			register('en', () => import('../../lang/en.json'));
			init({
				fallbackLocale: 'en',
				initialLocale: 'en'
			});
			document.documentElement.dir = 'ltr';
		} else if (ev == 'Arabic') {
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

<div class="ff-ppoins" style="display: flex;height:100vh;">
	<div class="logo-bg">
		<img src={B2BLogo} width="200px" alt="B2B logo" />
		<div class="logo-bg-bottom">
			<img src={illustration} alt="login background" class="illustration" />
			<span class="illustration_blockText ff-poppins-light"
				>{$_('Company Supplies Ordering Solution')}
			</span>
		</div>
	</div>
	<div class="content">
		<div class="language-bar">
			<div class="ff-poppins topLabel" style="cursor: default;">
				{$_('Company Portal')}
			</div>
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
		</div>
		<div class="forms">
			<slot />
		</div>
	</div>
</div>

{#if $loader}
	<Loader />
{/if}
