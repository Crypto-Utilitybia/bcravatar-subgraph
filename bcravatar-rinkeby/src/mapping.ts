import { BigInt } from '@graphprotocol/graph-ts'
import {
  // BCRAvatar,
  Approval,
  AvatarCreated,
  AvatarUpdated,
  ProfileCreated,
  ProfileUpdated,
  NFTRegistered,
  OwnershipTransferred,
  ServiceDonated,
  Transfer,
} from '../generated/BCRAvatar/BCRAvatar'
import {
  Approve,
  Avatar,
  Profile,
  Donation,
  Contract,
} from '../generated/schema'

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Approve.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Approve(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count.plus(BigInt.fromI32(1))

  // Entity fields can be set based on event parameters
  entity.owner = event.params.owner
  entity.spender = event.params.spender

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.allowance(...)
  // - contract.approve(...)
  // - contract.balanceOf(...)
  // - contract.baseURI(...)
  // - contract.decimals(...)
  // - contract.decreaseAllowance(...)
  // - contract.donations(...)
  // - contract.getAvatar(...)
  // - contract.increaseAllowance(...)
  // - contract.name(...)
  // - contract.owner(...)
  // - contract.symbol(...)
  // - contract.totalSupply(...)
  // - contract.transfer(...)
  // - contract.transferFrom(...)
}

function handleInfo(isProfile: boolean = false): void {
  let entity = Contract.load('1')
  if (!entity) {
    entity = new Contract('1')
    entity.avatars = BigInt.fromString('0')
    entity.profiles = BigInt.fromString('0')
  }
  const increase = BigInt.fromString('1')
  if (isProfile) {
    entity.profiles = entity.profiles.plus(increase)
  } else {
    entity.avatars = entity.avatars.plus(increase)
  }
  entity.save()
}

export function handleAvatarCreated(event: AvatarCreated): void {
  const entity = new Avatar(event.params.account.toHex())
  entity.uri = event.params.avatarURI
  entity.save()
  handleInfo()
}

export function handleAvatarUpdated(event: AvatarUpdated): void {
  const entity = Avatar.load(event.params.account.toHex())
  if (entity) {
    entity.uri = event.params.avatarURI
    entity.save()
  }
}

export function handleProfileCreated(event: ProfileCreated): void {
  const entity = new Profile(event.params.account.toHex())
  entity.uri = event.params.profileURI
  entity.save()
  handleInfo(true)
}

export function handleProfileUpdated(event: ProfileUpdated): void {
  const entity = Profile.load(event.params.account.toHex())
  if (entity) {
    entity.uri = event.params.profileURI
    entity.save()
  }
}

export function handleNFTRegistered(event: NFTRegistered): void {
  let entity = Avatar.load(event.params.account.toHex())
  if (!entity) {
    entity = new Avatar(event.params.account.toHex())
    handleInfo()
  }
  entity.nft = event.params.nft._contract
  entity.tokenId = event.params.nft.tokenId
  entity.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleServiceDonated(event: ServiceDonated): void {
  const entity = new Donation(event.transaction.from.toHex())
  entity.donator = event.params.account
  entity.amount = event.params.amount
  entity.save()
}

export function handleTransfer(event: Transfer): void {}
