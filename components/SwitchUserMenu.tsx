import { Session } from 'next-auth'
import { useSession } from "next-auth/react"
import { forwardRef } from 'react';
import { HiChevronDown, HiOutlinePencil, HiOutlineLogout, HiAdjustments, HiUserGroup } from "react-icons/hi";
import { Group, Avatar, Text, Menu, Divider, UnstyledButton, Button, UnstyledButtonProps } from '@mantine/core';

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

export default function SwitchUserMenu() {
  const { data: session } = useSession()

  if(!session)
  	return <></>;

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
	      <Menu.Item icon={<HiAdjustments />}>Modifier mes infos</Menu.Item>
	      <Menu.Item
	        icon={<HiUserGroup />}	// or HiOutlineClipboardCheck ???
	        // rightSection={<HiBell/><Badge size="xs" color="dimmed">3</Badge>}
	      >
	        Passer en mode validateur
	      </Menu.Item>

	      <Divider />
	      {/*<Menu.Label>Danger zone</Menu.Label>*/}

	      <Menu.Item color="red" icon={<HiOutlineLogout />}>Deconnexion</Menu.Item>
      </Menu>
    </Group>
  );
}
