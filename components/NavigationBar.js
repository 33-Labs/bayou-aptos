import Image from "next/image"
// import publicConfig from "../publicConfig"

export default function NavigationBar() {
  return (
    <>
      <div className="gap-x-2 flex items-center justify-between h-44">
        <div className="relative gap-x-2 flex items-center">
        <Image src="/bayou.png" alt="" width={50} height={50} priority />
        <label className="font-flow font-bold text-3xl">
          bayou
        </label>
        </div>

        {/* <label className="font-flow text-aptos-green border border-aptos-green text-sm whitespace-pre"> </label> */}
        <div className="flex gap-x-2 items-center">
          <div className="relative w-[22px] h-[22px] rounded-full">
            <Image src="/aptos.svg" alt="" objectPosition="50% 50%" objectFit="contain" layout="fill" priority />
          </div>
          <div className="relative w-6 h-6">
          <a
            href={"https://flow.bayou33.app"}
            target="_blank"
            rel="noopener noreferrer"
            className="">
            <Image src="/flow.png" alt="" objectPosition="50% 50%" objectFit="contain" layout="fill" priority />
          </a>
          </div>
        </div>

      </div>
    </>
  )
}