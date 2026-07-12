import pb from '@/lib/pocketbase/client'

export interface Establishment {
  id: string
  name: string
  type: string
  created: string
  updated: string
}

export const getEstablishments = async (): Promise<Establishment[]> =>
  pb.collection('establishments').getFullList({ sort: 'name' })

export const createEstablishment = async (data: {
  name: string
  type: string
}): Promise<Establishment> => pb.collection('establishments').create(data)

export const findOrCreateEstablishment = async (
  name: string,
  type: string,
): Promise<Establishment> => {
  try {
    return (await pb
      .collection('establishments')
      .getFirstListItem(`name = "${name}" && type = "${type}"`)) as unknown as Establishment
  } catch {
    return (await pb
      .collection('establishments')
      .create({ name, type })) as unknown as Establishment
  }
}
