import { ConfigDrawer } from '@/components/config-drawer'
import { FileBrowser, mockFileSystem } from '@/components/FileBrowser'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function FileBrowserDemo() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed fluid className='p-3 sm:p-4'>
        <FileBrowser root={mockFileSystem} className='h-full' />
      </Main>
    </>
  )
}
