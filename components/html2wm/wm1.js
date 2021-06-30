export default {
  tag: 'div',
  props: {
    style: {
      width: '256px',
      fontSize: '14px',
      lineHeight: '24px',
      background: 'rgba(255, 255, 255, .3)',
      borderRadius: '12px',
      overflow: 'hidden',
    }
  },
  children: [
    {
      tag: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(68, 137, 221, .4)',
        }
      },
      children: [
        {
          tag: 'img',
          props: {
            style: {
              width: '80px',
              height: '80px',
            },
            src: 'http://talk.fczcdn.com/storage/source/2021/2/2/10bede97-8d7a-4e72-baf2-3d1454b9555d.jpeg',
          },
        },
        {
          tag: 'div',
          props: {
            style: {
              flex: 1,
              color: '#fff',
              fontSize: '25px',
              textAlign: 'center',
            },
          },
          children: ['铺砖记录'],
        }
      ],
    },

    {
      tag: 'div',
      props: {
        style: {
        },
      },
      children: [
        {
          tag: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
          },
          children: [
            {
              tag: 'div',
              props: {
                style: {
                  flex: '0 0 58px',
                  width: '58px',
                  textAlignLast: 'justify',
                },
              },
              children: ['拍摄时间'],
            },
            {
              tag: 'div',
              props: {},
              children: ['：'],
            },
            {
              tag: 'div',
              type: 'date',
              props: {},
              children: ['YYYY年MM月DD日 HH:mm'],
            },
          ],
        },

        {
          tag: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
          },
          children: [
            {
              tag: 'div',
              props: {
                style: {
                  flex: '0 0 58px',
                  width: '58px',
                  textAlignLast: 'justify',
                },
              },
              children: ['地点'],
            },
            {
              tag: 'div',
              props: {},
              children: ['：'],
            },
            {
              tag: 'div',
              props: {},
              children: ['湖北·襄阳·高新区'],
            },
          ],
        },

        {
          tag: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
          },
          children: [
            {
              tag: 'div',
              props: {
                style: {
                  flex: '0 0 58px',
                  width: '58px',
                  textAlignLast: 'justify',
                },
              },
              children: ['电话'],
            },
            {
              tag: 'div',
              props: {},
              children: ['：'],
            },
            {
              tag: 'div',
              props: {},
              children: ['400-0710-3322110'],
            },
          ],
        },
      ],
    },
  ],
}
