// import Link from 'next/link'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import { useSession, signOut } from "next-auth/react"
import { forwardRef } from 'react';
import { HiChevronDown, HiOutlinePencil, HiOutlineLogout, HiAdjustments, HiUserGroup, HiClipboardList, HiOutlinePresentationChartLine } from "react-icons/hi";
import { Group, Avatar, Text, Menu, Divider, UnstyledButton, Button, UnstyledButtonProps } from '@mantine/core';
import { USER_ROLES } from '../entity/utils';

interface UserButtonProps extends UnstyledButtonProps {
  name: string;
  email: string;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ name, email, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      sx={(theme) => ({
      	borderRadius: '0.5em',
        display: 'block',
        width: '100%',
        padding: '0.5em', // theme.spacing.xs,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
      {...others}
    >
      <Group>
        <div style={{ flex: 1 }}>
          <Text size="sm" weight={500} style={{ textTransform: "capitalize" }}>
            {name}
          </Text>

          <Text color="dimmed" size="xs">
            {email}
          </Text>
        </div>

        <Avatar style={{ marginLeft: 5 }} color="blue">
	        {name
	          .split(' ')
	          .map((part) => part.charAt(0).toUpperCase())
	          .slice(0, 2)
	          .join('')}
	      </Avatar>
      </Group>
    </UnstyledButton>
  )
);
UserButton.displayName = "UserButton";

export default function SwitchUserMenu() {
  const { data: session } = useSession()
  const router = useRouter();
  const year = parseInt(router.query.params as string);

  // TODO: extract home/validateur like this ? Or store it in session ?
  var re = /validateur/g;
  var str = router.route;
  var isOnValidatorRoute = str.match(re) !== null;

  // Menu only available when the user is logged in
  if(!session)
  	return <></>;

  let toogleModeItem = <></>;
  if(session.role === USER_ROLES.CHEF_DE_SERVICE) {
    if(isOnValidatorRoute) {
      toogleModeItem = <Menu.Item
            icon={<HiClipboardList />}  // or HiTemplate or HiClipboard ???
            component="a" href="/home" // component={Link} to="/home"
          >
            Gérer mes notes de frais
          </Menu.Item>;
    } else {
      toogleModeItem = <Menu.Item
            icon={<HiUserGroup />}  // or HiOutlineClipboardCheck ???
            // rightSection={<HiBell/><Badge size="xs" color="dimmed">{notifications.user.length()}</Badge>}
            component="a" href="/validateur" // component={Link} to="/validateur"
          >
            Passer en mode validateur
          </Menu.Item>;
    }
  }

  return (
    <Group position="center">
      <Menu
        // withArrow
        placement="end"
        control={
          <UserButton
            name={session.prenom + " " + session.nom}
            email={session.email + ""}	// trick to pass string...
          />
        }
        transition="scale-y"
      >
	      <Menu.Label>Mon profil</Menu.Label>
	      <Menu.Item disabled icon={<HiAdjustments />}>
          Modifier mes infos
        </Menu.Item>

        <Menu.Item disabled icon={<HiOutlinePresentationChartLine/>}>
          Statistiques
        </Menu.Item>

        {/* TODO: Switch back to /home if already on /validateur */}
	      { toogleModeItem }

	      <Divider />

	      <Menu.Item onClick={() => /*preventPageChangeWithEditedNote(),*/ signOut()}
	      	color="red" icon={<HiOutlineLogout />}
	      >
	      	Deconnexion
	      </Menu.Item>
      </Menu>
    </Group>
  );
}
